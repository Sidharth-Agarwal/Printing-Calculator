import React, { useState } from "react";
import FormGroup from "../containers/FormGroup";
import FormToggle from "../fields/FormToggle";
import SelectField from "../fields/SelectField";
import NumberField from "../fields/NumberField";
import AccordionSection from "../containers/AccordionSection";

const SandwichSection = ({ state, dispatch }) => {
  const { isSandwichComponentUsed = false } = state.sandwich || {};
  const dieSize = state.orderAndPaper?.dieSize || { length: "", breadth: "" };

  const inchesToCm = (inches) => parseFloat(inches) * 2.54;

  const toggleComponentUsage = () => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: { 
        isSandwichComponentUsed: !isSandwichComponentUsed,
        // Reset other sandwich details if turning off
        ...(isSandwichComponentUsed && {
          lpDetailsSandwich: {
            isLPUsed: false,
            noOfColors: 0,
            colorDetails: [],
          },
          fsDetailsSandwich: {
            isFSUsed: false,
            fsType: "",
            foilDetails: [],
          },
          embDetailsSandwich: {
            isEMBUsed: false,
            plateSizeType: "",
            plateDimensions: { length: "", breadth: "" },
            plateTypeMale: "",
            plateTypeFemale: "",
            embMR: "",
          },
        })
      },
    });
  };

  return (
    <div className="space-y-6">
      <FormToggle
        label="Use Sandwich Component?"
        isChecked={isSandwichComponentUsed}
        onChange={toggleComponentUsage}
      />

      {isSandwichComponentUsed && (
        <div className="space-y-6">
          {/* LP Section */}
          <AccordionSection title="LETTER PRESS (LP) DETAILS" className="border-none">
            <SandwichLPSection state={state} dispatch={dispatch} dieSize={dieSize} />
          </AccordionSection>
          
          {/* FS Section */}
          <AccordionSection title="FOIL STAMPING (FS) DETAILS" className="border-none">
            <SandwichFSSection state={state} dispatch={dispatch} dieSize={dieSize} />
          </AccordionSection>
          
          {/* EMB Section */}
          <AccordionSection title="EMBOSSING (EMB) DETAILS" className="border-none">
            <SandwichEMBSection state={state} dispatch={dispatch} dieSize={dieSize} />
          </AccordionSection>
        </div>
      )}
    </div>
  );
};

// LP Section for Sandwich
const SandwichLPSection = ({ state, dispatch, dieSize }) => {
  const lpDetailsSandwich = state.sandwich?.lpDetailsSandwich || {
    isLPUsed: false,
    noOfColors: 0,
    colorDetails: []
  };
  
  const inchesToCm = (inches) => parseFloat(inches) * 2.54;
  
  const toggleLPUsed = () => {
    const updatedIsLPUsed = !lpDetailsSandwich.isLPUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          isLPUsed: updatedIsLPUsed,
          noOfColors: updatedIsLPUsed ? 1 : 0,
          colorDetails: updatedIsLPUsed
            ? [
                {
                  plateSizeType: "Auto",
                  plateDimensions: { 
                    length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                    breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                  },
                  pantoneType: "",
                  plateType: "Polymer Plate",
                  mrType: "Simple",
                },
              ]
            : [],
        },
      },
    });
  };
  
  const handleNoOfColorsChange = (e) => {
    const value = parseInt(e.target.value, 10) || 0;
    
    // Generate new color details based on the new number of colors
    const newColorDetails = Array.from({ length: value }, (_, index) => {
      // Keep existing color details if they exist
      if (index < lpDetailsSandwich.colorDetails.length) {
        return lpDetailsSandwich.colorDetails[index];
      }
      
      // Create new color detail with defaults
      return {
        plateSizeType: "Auto",
        plateDimensions: { 
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
        },
        pantoneType: "",
        plateType: "Polymer Plate",
        mrType: "Simple",
      };
    });
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          noOfColors: value,
          colorDetails: newColorDetails,
        },
      },
    });
  };
  
  const handleColorDetailsChange = (index, field, value) => {
    const updatedDetails = [...lpDetailsSandwich.colorDetails];
    
    if (field === "plateSizeType") {
      updatedDetails[index].plateSizeType = value;
      
      // Reset plate dimensions when switching to Manual
      if (value === "Manual") {
        updatedDetails[index].plateDimensions = { length: "", breadth: "" };
      }
      
      // Populate dimensions when switching to Auto
      if (value === "Auto") {
        updatedDetails[index].plateDimensions = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "plateDimensions") {
      updatedDetails[index].plateDimensions = {
        ...updatedDetails[index].plateDimensions,
        ...value,
      };
    } else {
      updatedDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        lpDetailsSandwich: {
          ...lpDetailsSandwich,
          colorDetails: updatedDetails,
        },
      },
    });
  };
  
  return (
    <div className="space-y-4">
      <FormToggle
        label="Use LP Component?"
        isChecked={lpDetailsSandwich.isLPUsed}
        onChange={toggleLPUsed}
      />
      
      {lpDetailsSandwich.isLPUsed && (
        <>
          <FormGroup
            label="No of Colors"
            htmlFor="lpSandwichNoOfColors"
          >
            <NumberField
              id="lpSandwichNoOfColors"
              value={lpDetailsSandwich.noOfColors}
              onChange={handleNoOfColorsChange}
              min={1}
              max={10}
            />
          </FormGroup>
          
          {lpDetailsSandwich.noOfColors > 0 && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Color Details</h3>
              {lpDetailsSandwich.colorDetails.map((color, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <h4 className="text-sm font-semibold mb-2">Color {index + 1}</h4>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {/* Plate Size Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Plate Size Type:</label>
                      <SelectField
                        value={color.plateSizeType || "Auto"}
                        onChange={(e) => 
                          handleColorDetailsChange(index, "plateSizeType", e.target.value)
                        }
                        options={["Auto", "Manual"]}
                      />
                    </div>
                    
                    {/* Plate Dimensions */}
                    {color.plateSizeType && (
                      <>
                        <div className="flex-1">
                          <label className="block mb-1">Length (cm):</label>
                          <NumberField
                            value={color.plateDimensions?.length || ""}
                            onChange={(e) => 
                              handleColorDetailsChange(index, "plateDimensions", {
                                length: e.target.value
                              })
                            }
                            disabled={color.plateSizeType === "Auto"}
                            className={color.plateSizeType === "Auto" ? "bg-gray-100" : ""}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block mb-1">Breadth (cm):</label>
                          <NumberField
                            value={color.plateDimensions?.breadth || ""}
                            onChange={(e) => 
                              handleColorDetailsChange(index, "plateDimensions", {
                                breadth: e.target.value
                              })
                            }
                            disabled={color.plateSizeType === "Auto"}
                            className={color.plateSizeType === "Auto" ? "bg-gray-100" : ""}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Pantone Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Pantone Type:</label>
                      <input
                        type="text"
                        className="border rounded-md p-2 w-full"
                        placeholder="Enter Pantone Type"
                        value={color.pantoneType || ""}
                        onChange={(e) => 
                          handleColorDetailsChange(index, "pantoneType", e.target.value)
                        }
                      />
                    </div>
                    
                    {/* Plate Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Plate Type:</label>
                      <SelectField
                        value={color.plateType || "Polymer Plate"}
                        onChange={(e) => 
                          handleColorDetailsChange(index, "plateType", e.target.value)
                        }
                        options={["Polymer Plate"]}
                      />
                    </div>
                    
                    {/* MR Type */}
                    <div className="flex-1">
                      <label className="block mb-1">MR Type:</label>
                      <SelectField
                        value={color.mrType || "Simple"}
                        onChange={(e) => 
                          handleColorDetailsChange(index, "mrType", e.target.value)
                        }
                        options={["Simple", "Complex", "Super Complex"]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// FS Section for Sandwich
const SandwichFSSection = ({ state, dispatch, dieSize }) => {
  const fsDetailsSandwich = state.sandwich?.fsDetailsSandwich || {
    isFSUsed: false,
    fsType: "",
    foilDetails: []
  };
  
  const inchesToCm = (inches) => parseFloat(inches) * 2.54;
  
  const toggleFSUsed = () => {
    const updatedIsFSUsed = !fsDetailsSandwich.isFSUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          isFSUsed: updatedIsFSUsed,
          fsType: updatedIsFSUsed ? "FS1" : "",
          foilDetails: updatedIsFSUsed
            ? [
                {
                  blockSizeType: "Auto",
                  blockDimension: { 
                    length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                    breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
                  },
                  foilType: "Gold MTS 220",
                  blockType: "Magnesium Block 3MM",
                  mrType: "Simple",
                },
              ]
            : [],
        },
      },
    });
  };
  
  const handleFSTypeChange = (e) => {
    const value = e.target.value;
    const numFoils = parseInt(value.replace("FS", ""), 10) || 0;
    
    // Generate new foil details based on the FS type
    const newFoilDetails = Array.from({ length: numFoils }, (_, index) => {
      // Keep existing foil details if they exist
      if (index < fsDetailsSandwich.foilDetails.length) {
        return fsDetailsSandwich.foilDetails[index];
      }
      
      // Create new foil detail with defaults
      return {
        blockSizeType: "Auto",
        blockDimension: { 
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
        },
        foilType: "Gold MTS 220",
        blockType: "Magnesium Block 3MM",
        mrType: "Simple",
      };
    });
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          fsType: value,
          foilDetails: newFoilDetails,
        },
      },
    });
  };
  
  const handleFoilDetailsChange = (index, field, value) => {
    const updatedFoilDetails = [...fsDetailsSandwich.foilDetails];
    
    if (field === "blockSizeType") {
      updatedFoilDetails[index].blockSizeType = value;
      
      // Reset block dimensions when switching to Manual
      if (value === "Manual") {
        updatedFoilDetails[index].blockDimension = { length: "", breadth: "" };
      }
      
      // Populate dimensions when switching to Auto
      if (value === "Auto") {
        updatedFoilDetails[index].blockDimension = {
          length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
          breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
        };
      }
    } else if (field === "blockDimension") {
      updatedFoilDetails[index].blockDimension = {
        ...updatedFoilDetails[index].blockDimension,
        ...value,
      };
    } else {
      updatedFoilDetails[index][field] = value;
    }
    
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        fsDetailsSandwich: {
          ...fsDetailsSandwich,
          foilDetails: updatedFoilDetails,
        },
      },
    });
  };
  
  const FOIL_TYPES = [
    "Rosegold MTS 355",
    "Gold MTS 220",
    "White 911",
    "Blk MTS 362",
    "Silver ALUFIN PMAL METALITE",
    "MTS 432 PINK"
  ];

  const BLOCK_TYPES = [
    "Magnesium Block 3MM",
    "Magnesium Block 4MM",
    "Magnesium Block 5MM",
    "Male Block",
    "Female Block"
  ];
  
  return (
    <div className="space-y-4">
      <FormToggle
        label="Use FS Component?"
        isChecked={fsDetailsSandwich.isFSUsed}
        onChange={toggleFSUsed}
      />
      
      {fsDetailsSandwich.isFSUsed && (
        <>
          <FormGroup
            label="FS Type"
            htmlFor="fsSandwichType"
          >
            <SelectField
              id="fsSandwichType"
              value={fsDetailsSandwich.fsType}
              onChange={handleFSTypeChange}
              options={["FS1", "FS2", "FS3", "FS4", "FS5"]}
              placeholder="Select FS Type"
            />
          </FormGroup>
          
          {fsDetailsSandwich.fsType && (
            <div>
              <h3 className="text-md font-semibold mt-4 mb-2">Foil Details</h3>
              {fsDetailsSandwich.foilDetails.map((foil, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 border rounded-md bg-gray-50"
                >
                  <h4 className="text-sm font-semibold mb-2">Foil {index + 1}</h4>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {/* Block Size Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Block Size (cm):</label>
                      <SelectField
                        value={foil.blockSizeType || "Auto"}
                        onChange={(e) => 
                          handleFoilDetailsChange(index, "blockSizeType", e.target.value)
                        }
                        options={["Auto", "Manual"]}
                      />
                    </div>
                    
                    {/* Block Dimensions */}
                    {foil.blockSizeType && (
                      <>
                        <div className="flex-1">
                          <label className="block mb-1">Length:</label>
                          <NumberField
                            value={foil.blockDimension?.length || ""}
                            onChange={(e) => 
                              handleFoilDetailsChange(index, "blockDimension", {
                                length: e.target.value
                              })
                            }
                            disabled={foil.blockSizeType === "Auto"}
                            className={foil.blockSizeType === "Auto" ? "bg-gray-100" : ""}
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block mb-1">Breadth:</label>
                          <NumberField
                            value={foil.blockDimension?.breadth || ""}
                            onChange={(e) => 
                              handleFoilDetailsChange(index, "blockDimension", {
                                breadth: e.target.value
                              })
                            }
                            disabled={foil.blockSizeType === "Auto"}
                            className={foil.blockSizeType === "Auto" ? "bg-gray-100" : ""}
                          />
                        </div>
                      </>
                    )}
                    
                    {/* Foil Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Foil Type:</label>
                      <SelectField
                        value={foil.foilType || "Gold MTS 220"}
                        onChange={(e) => 
                          handleFoilDetailsChange(index, "foilType", e.target.value)
                        }
                        options={FOIL_TYPES}
                      />
                    </div>
                    
                    {/* Block Type */}
                    <div className="flex-1">
                      <label className="block mb-1">Block Type:</label>
                      <SelectField
                        value={foil.blockType || "Magnesium Block 3MM"}
                        onChange={(e) => 
                          handleFoilDetailsChange(index, "blockType", e.target.value)
                        }
                        options={BLOCK_TYPES}
                      />
                    </div>
                    
                    {/* MR Type */}
                    <div className="flex-1">
                      <label className="block mb-1">MR Type:</label>
                      <SelectField
                        value={foil.mrType || "Simple"}
                        onChange={(e) => 
                          handleFoilDetailsChange(index, "mrType", e.target.value)
                        }
                        options={["Simple", "Complex", "Super Complex"]}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// EMB Section for Sandwich
const SandwichEMBSection = ({ state, dispatch, dieSize }) => {
  const embDetailsSandwich = state.sandwich?.embDetailsSandwich || {
    isEMBUsed: false,
    plateSizeType: "",
    plateDimensions: { length: "", breadth: "" },
    plateTypeMale: "",
    plateTypeFemale: "",
    embMR: "",
  };
  
  const inchesToCm = (inches) => parseFloat(inches) * 2.54;
  
  const toggleEMBUsed = () => {
    const updatedIsEMBUsed = !embDetailsSandwich.isEMBUsed;
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          isEMBUsed: updatedIsEMBUsed,
          plateSizeType: updatedIsEMBUsed ? "Auto" : "",
          plateDimensions: updatedIsEMBUsed
            ? { 
                length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "", 
                breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "" 
              }
            : { length: "", breadth: "" },
          plateTypeMale: updatedIsEMBUsed ? "Polymer Plate" : "",
          plateTypeFemale: updatedIsEMBUsed ? "Polymer Plate" : "",
          embMR: updatedIsEMBUsed ? "Simple" : "",
        },
      },
    });
  };
  
  const handleChange = (name, value) => {
    if (name === "plateSizeType") {
      const updatedPlateDimensions = value === "Auto"
        ? {
            length: dieSize.length ? inchesToCm(dieSize.length).toFixed(2) : "",
            breadth: dieSize.breadth ? inchesToCm(dieSize.breadth).toFixed(2) : "",
          }
        : { length: "", breadth: "" };
      
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            plateSizeType: value,
            plateDimensions: updatedPlateDimensions,
          },
        },
      });
    } else {
      dispatch({
        type: "UPDATE_SANDWICH",
        payload: {
          embDetailsSandwich: {
            ...embDetailsSandwich,
            [name]: value,
          },
        },
      });
    }
  };
  
  const handleDimensionChange = (field, value) => {
    dispatch({
      type: "UPDATE_SANDWICH",
      payload: {
        embDetailsSandwich: {
          ...embDetailsSandwich,
          plateDimensions: {
            ...embDetailsSandwich.plateDimensions,
            [field]: value,
          },
        },
      },
    });
  };
  
  return (
    <div className="space-y-4">
      <FormToggle
        label="Use EMB Component?"
        isChecked={embDetailsSandwich.isEMBUsed}
        onChange={toggleEMBUsed}
      />
      
      {embDetailsSandwich.isEMBUsed && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Plate Size Type */}
            <div className="flex-1">
              <label className="block mb-1">Plate Size Type:</label>
              <SelectField
                value={embDetailsSandwich.plateSizeType}
                onChange={(e) => handleChange("plateSizeType", e.target.value)}
                options={["Auto", "Manual"]}
                placeholder="Select Plate Size Type"
              />
            </div>
            
            {/* Plate Dimensions */}
            {embDetailsSandwich.plateSizeType && (
              <>
                <div className="flex-1">
                  <label className="block mb-1">Length (cm):</label>
                  <NumberField
                    value={embDetailsSandwich.plateDimensions.length || ""}
                    onChange={(e) => handleDimensionChange("length", e.target.value)}
                    disabled={embDetailsSandwich.plateSizeType === "Auto"}
                    className={embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block mb-1">Breadth (cm):</label>
                  <NumberField
                    value={embDetailsSandwich.plateDimensions.breadth || ""}
                    onChange={(e) => handleDimensionChange("breadth", e.target.value)}
                    disabled={embDetailsSandwich.plateSizeType === "Auto"}
                    className={embDetailsSandwich.plateSizeType === "Auto" ? "bg-gray-100" : ""}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            {/* Plate Type Male */}
            <div className="flex-1">
              <label className="block mb-1">Plate Type Male:</label>
              <SelectField
                value={embDetailsSandwich.plateTypeMale}
                onChange={(e) => handleChange("plateTypeMale", e.target.value)}
                options={["Polymer Plate"]}
                placeholder="Select Plate Type Male"
              />
            </div>
            
            {/* Plate Type Female */}
            <div className="flex-1">
              <label className="block mb-1">Plate Type Female:</label>
              <SelectField
                value={embDetailsSandwich.plateTypeFemale}
                onChange={(e) => handleChange("plateTypeFemale", e.target.value)}
                options={["Polymer Plate"]}
                placeholder="Select Plate Type Female"
              />
            </div>
            
            {/* EMB MR */}
            <div className="flex-1">
              <label className="block mb-1">EMB MR:</label>
              <SelectField
                value={embDetailsSandwich.embMR}
                onChange={(e) => handleChange("embMR", e.target.value)}
                options={["Simple", "Complex", "Super Complex"]}
                placeholder="Select MR Type"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SandwichSection;