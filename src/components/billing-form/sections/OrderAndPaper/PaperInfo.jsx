import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import FormGroup from "../../containers/FormGroup";
import SelectField from "../../fields/SelectField";

const PaperInfo = ({ paperProvided, paperName, dispatch }) => {
  const [papers, setPapers] = useState([]);

  // Fetch papers from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "papers"), (snapshot) => {
      const paperData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPapers(paperData);
      
      // If papers are loaded and no paper name is selected yet, set the first paper
      if (paperData.length > 0 && !paperName) {
        dispatch({
          type: "UPDATE_ORDER_AND_PAPER",
          payload: {
            paperName: paperData[0].paperName
          },
        });
      }
    });

    return () => unsubscribe();
  }, [dispatch, paperName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: { [name]: value }
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Paper Information</h3>
      <div className="space-y-4">
        <FormGroup 
          label="Paper Provided" 
          htmlFor="paperProvided"
          required
        >
          <SelectField
            id="paperProvided"
            name="paperProvided"
            value={paperProvided || "Yes"}
            onChange={handleChange}
            options={["Yes", "No"]}
            required
          />
        </FormGroup>

        <FormGroup 
          label="Paper Name" 
          htmlFor="paperName"
          required
        >
          <SelectField
            id="paperName"
            name="paperName"
            value={paperName || (papers.length > 0 ? papers[0].paperName : "")}
            onChange={handleChange}
            options={papers.map((paper) => paper.paperName)}
            placeholder="Select paper"
            required
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default PaperInfo;