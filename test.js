// =====================================================
// COMPLETE BILLINGFORM.JSX FIXES FOR EDIT MODE MARKUP
// =====================================================

// 1. ADD NEW REF at the top with other refs (around line 100)
const markupInitializedRef = useRef(false);

// 2. REPLACE the initialization useEffect (around line 930-980) with this:
useEffect(() => {
  if (initialState && isEditMode) {
    // Initialize form state with the provided data
    dispatch({ type: "INITIALIZE_FORM", payload: initialState });
    
    // Log critical fields for debugging
    console.log("BillingForm - Initializing with data:", {
      projectName: initialState.orderAndPaper?.projectName,
      jobType: initialState.orderAndPaper?.jobType,
      quantity: initialState.orderAndPaper?.quantity,
      paperName: initialState.orderAndPaper?.paperName,
      dieCode: initialState.orderAndPaper?.dieCode
    });
    
    // If client info exists in initialState, set the client for display
    if (initialState.client?.clientId) {
      console.log("Setting client from initialState:", initialState.client);
      
      // Create a client object from client info
      const clientData = {
        id: initialState.client.clientId,
        clientId: initialState.client.clientId,
        name: initialState.client.clientInfo?.name || "Unknown Client",
        clientCode: initialState.client.clientInfo?.clientCode || "",
        clientType: initialState.client.clientInfo?.clientType || "Direct",
        contactPerson: initialState.client.clientInfo?.contactPerson || "",
        email: initialState.client.clientInfo?.email || "",
        phone: initialState.client.clientInfo?.phone || "",
        ...initialState.client.clientInfo // Include any other client properties
      };
      
      // Set the selected client for display
      setSelectedClient(clientData);
    }
    
    // Set selected version if it exists in initialState
    if (initialState.versionId) {
      setSelectedVersion(initialState.versionId);
    }
    
    // CRITICAL FIX: In edit mode, LOCK markup values from saved calculations
    if (initialState.calculations?.markupType && initialState.calculations?.markupPercentage) {
      console.log("🔒 EDIT MODE - BillingForm: LOCKING markup from saved calculations:", {
        type: initialState.calculations.markupType,
        percentage: initialState.calculations.markupPercentage
      });
      
      // Set markup values and mark them as locked for edit mode
      setSelectedMarkupType(initialState.calculations.markupType);
      setMarkupPercentage(parseFloat(initialState.calculations.markupPercentage));
      
      // Set the calculations immediately and prevent further overrides
      setCalculations(initialState.calculations);
      
      // CRITICAL: Mark that edit mode markup has been set to prevent further changes
      markupInitializedRef.current = true;
    }
    
    // Mark initialization as done for edit mode
    setDirectInitializationDone(true);
  }
}, [initialState, isEditMode]);

// 3. REPLACE the default markup fetching useEffect (around line 1050-1090) with this:
useEffect(() => {
  const fetchDefaultMarkup = async () => {
    // CRITICAL: Skip in edit mode to prevent overriding saved markup
    if (isEditMode) {
      console.log("🚫 EDIT MODE: Skipping default markup fetch");
      return;
    }
    
    // CRITICAL: Skip if markup already initialized from saved data
    if (markupInitializedRef.current) {
      console.log("🚫 Markup already initialized, skipping default fetch");
      return;
    }
    
    try {
      // Query the overheads collection for markup entries
      const overheadsCollection = collection(db, "overheads");
      const markupQuery = query(overheadsCollection, where("name", ">=", "MARKUP "), where("name", "<=", "MARKUP" + "\uf8ff"));
      const querySnapshot = await getDocs(markupQuery);
      
      const fetchedMarkups = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        fetchedMarkups.push({
          id: doc.id,
          name: data.name,
          percentage: parseFloat(data.percentage) || 0
        });
      });
      
      if (fetchedMarkups.length > 0) {
        // For B2B clients, automatically select MARKUP B2B MERCH
        if (isB2BClient) {
          const b2bMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP B2B MERCH");
          if (b2bMarkup) {
            setDefaultMarkup({
              type: b2bMarkup.name,
              percentage: b2bMarkup.percentage
            });
            setSelectedMarkupType(b2bMarkup.name);
            setMarkupPercentage(b2bMarkup.percentage);
          } else {
            // Fallback to default if B2B MERCH not found
            setDefaultMarkup({
              type: fetchedMarkups[0].name,
              percentage: fetchedMarkups[0].percentage
            });
            setSelectedMarkupType(fetchedMarkups[0].name);
            setMarkupPercentage(fetchedMarkups[0].percentage);
          }
        } else {
          // For admin users, set default markup to MARKUP TIMELESS or first available
          const timelessMarkup = fetchedMarkups.find(rate => rate.name === "MARKUP TIMELESS") || fetchedMarkups[0];
          setDefaultMarkup({
            type: timelessMarkup.name,
            percentage: timelessMarkup.percentage
          });
          setSelectedMarkupType(timelessMarkup.name);
          setMarkupPercentage(timelessMarkup.percentage);
        }
        
        console.log("Fetched markup rates:", fetchedMarkups);
        markupInitializedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching markup rates:", error);
    }
  };
  
  fetchDefaultMarkup();
}, [isB2BClient, isEditMode]); // ADD isEditMode dependency

// 4. UPDATE the handleMarkupChange function (around line 1400-1450) with this guard:
const handleMarkupChange = async (markupType, markupPercentage) => {
  // In edit mode, only allow changes if explicitly triggered by user action
  if (isEditMode) {
    console.log("⚠️ EDIT MODE: Markup change requested - this should only happen from user action in ReviewAndSubmit");
    // Don't prevent the change, just log it for debugging
  }
  
  // For B2B clients, only allow MARKUP B2B MERCH to be selected (in new mode only)
  if (isB2BClient && !isEditMode && markupType !== "MARKUP B2B MERCH") {
    const b2bMarkup = markupRates.find(rate => rate.name === "MARKUP B2B MERCH");
    if (b2bMarkup) {
      markupType = b2bMarkup.name;
      markupPercentage = b2bMarkup.percentage;
    }
  }
  
  setSelectedMarkupType(markupType);
  setMarkupPercentage(markupPercentage);
  
  await recalculateWithMarkup(markupType, markupPercentage);
};

// 5. ADD cleanup in the existing cleanup useEffect or create new one:
useEffect(() => {
  return () => {
    markupInitializedRef.current = false;
  };
}, []);

// 6. UPDATE the recalculateWithMarkup function (around line 1440-1490) to handle edit mode properly:
const recalculateWithMarkup = async (markupType, markupPercentage) => {
  console.log("Recalculating with new markup:", markupType, markupPercentage);
  setIsCalculating(true);
  try {
    const jobType = state.orderAndPaper?.jobType || "Card";
    
    // Get GST rate (cached or fresh) for this job type
    const gstRate = await getGSTRateForJobType(jobType);
    
    // Get the misc charge from the form state if available and misc is enabled
    const miscCharge = state.misc?.isMiscUsed && state.misc?.miscCharge 
      ? parseFloat(state.misc.miscCharge) 
      : null;

    // CRITICAL FIX: Handle edit mode differently
    if (isEditMode && calculations && !calculations.error) {
      console.log("Edit mode detected - using simplified markup recalculation");
      
      // Use the displayed subtotal as the base for markup calculation
      const subtotalPerCard = parseFloat(calculations.subtotalPerCard || calculations.costWithMisc || 0);
      const quantity = parseInt(state.orderAndPaper?.quantity || 1);
      
      // Calculate new markup amount based on displayed subtotal
      const newMarkupAmount = subtotalPerCard * (markupPercentage / 100);
      const newTotalCostPerCard = subtotalPerCard + newMarkupAmount;
      const newTotalCost = newTotalCostPerCard * quantity;
      
      // Recalculate GST on the new total
      const newGstAmount = newTotalCost * (gstRate / 100);
      const newTotalWithGST = newTotalCost + newGstAmount;
      
      // Create updated calculations object
      const updatedCalculations = {
        ...calculations,
        markupType: markupType,
        markupPercentage: markupPercentage,
        markupAmount: newMarkupAmount.toFixed(2),
        totalCostPerCard: newTotalCostPerCard.toFixed(2),
        totalCost: newTotalCost.toFixed(2),
        gstRate: gstRate,
        gstAmount: newGstAmount.toFixed(2),
        totalWithGST: newTotalWithGST.toFixed(2)
      };
      
      console.log("Edit mode markup recalculation completed:", {
        subtotalPerCard: subtotalPerCard.toFixed(2),
        markupPercentage,
        markupAmount: newMarkupAmount.toFixed(2),
        totalCostPerCard: newTotalCostPerCard.toFixed(2),
        totalCost: newTotalCost.toFixed(2),
        gstAmount: newGstAmount.toFixed(2),
        totalWithGST: newTotalWithGST.toFixed(2)
      });
      
      setCalculations(updatedCalculations);
      return;
    }

    // For new estimates (non-edit mode), use the existing complex recalculation logic
    console.log("New estimate mode - using full recalculation logic");
    
    // Use the recalculateTotals function from calculationsService if we already have base calculations
    if (calculations && !calculations.error) {
      console.log("Using existing calculations for recalculation");
      
      // Call recalculateTotals with the existing calculations, updated markup info, quantity, and fresh GST rate
      const result = await recalculateTotals(
        calculations,
        miscCharge, // Use the custom misc charge if available
        markupPercentage,
        parseInt(state.orderAndPaper?.quantity, 10) || 0,
        markupType,
        state.orderAndPaper?.jobType || "Card",
        null, // clientLoyaltyTier
        gstRate // ⭐ Pass fresh GST rate
      );

      if (result.error) {
        console.error("Error recalculating with new markup:", result.error);
        // Don't update calculations if there's an error
      } else {
        console.log("Updated calculations with new markup:", result);
        setCalculations(result);
      }
    } else {
      console.log("No existing calculations - performing complete calculation");
      
      // If we don't have base calculations yet, perform a complete calculation
      const result = await performCompleteCalculations(
        state,
        miscCharge, // Use the custom misc charge if available
        markupPercentage,
        markupType,
        gstRate // ⭐ Pass fresh GST rate
      );
      
      if (result.error) {
        console.error("Error during complete calculations:", result.error);
        // Don't update calculations if there's an error
      } else {
        console.log("Complete calculations performed successfully:", result);
        setCalculations(result);
      }
    }
  } catch (error) {
    console.error("Unexpected error during markup recalculation:", error);
    
    // Fallback: If there's an error and we're in edit mode, try a simple calculation
    if (isEditMode && calculations && !calculations.error) {
      try {
        const subtotalPerCard = parseFloat(calculations.subtotalPerCard || 0);
        const quantity = parseInt(state.orderAndPaper?.quantity || 1);
        const fallbackGstRate = 18; // Default GST rate
        
        const markupAmount = subtotalPerCard * (markupPercentage / 100);
        const totalCostPerCard = subtotalPerCard + markupAmount;
        const totalCost = totalCostPerCard * quantity;
        const gstAmount = totalCost * (fallbackGstRate / 100);
        const totalWithGST = totalCost + gstAmount;
        
        const fallbackCalculations = {
          ...calculations,
          markupType: markupType,
          markupPercentage: markupPercentage,
          markupAmount: markupAmount.toFixed(2),
          totalCostPerCard: totalCostPerCard.toFixed(2),
          totalCost: totalCost.toFixed(2),
          gstRate: fallbackGstRate,
          gstAmount: gstAmount.toFixed(2),
          totalWithGST: totalWithGST.toFixed(2),
          error: "Using fallback calculation due to error"
        };
        
        console.log("Applied fallback calculation for edit mode:", fallbackCalculations);
        setCalculations(fallbackCalculations);
      } catch (fallbackError) {
        console.error("Even fallback calculation failed:", fallbackError);
      }
    }
  } finally {
    setIsCalculating(false);
  }
};