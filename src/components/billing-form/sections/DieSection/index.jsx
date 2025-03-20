import React, { useState } from "react";
import DieSelection from "./DieSelection";
import DieDisplay from "./DieDisplay";
import DieSelectionPopup from "../DieUpdate/DieSelectionPopUp";
import AddDieFormForPopup from "../DieUpdate/AddDieFormPopup";

const DieSection = ({ state, dispatch }) => {
  const { dieSelection, dieCode, dieSize, image } = state.orderAndPaper || {};
  const [showDiePopup, setShowDiePopup] = useState(false);
  const [showAddDiePopup, setShowAddDiePopup] = useState(false);

  const handleDieSelect = (die) => {
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: {
        dieSelection: die.dieName || "",
        dieCode: die.dieCode || "",
        dieSize: { length: die.dieSizeL || "", breadth: die.dieSizeB || "" },
        image: die.imageUrl || "",
      },
    });
    setShowDiePopup(false);
  };

  const handleAddDieSuccess = (newDie) => {
    handleDieSelect(newDie);
    setShowAddDiePopup(false);
  };

  return (
    <div className="space-y-4">
      <DieSelection 
        dieSelection={dieSelection} 
        onSelectDie={() => setShowDiePopup(true)} 
      />
      
      <DieDisplay 
        dieCode={dieCode}
        dieSize={dieSize}
        image={image}
        dispatch={dispatch}
      />
      
      {/* Die Selection Popup */}
      {showDiePopup && (
        <DieSelectionPopup
          dispatch={dispatch}
          onClose={() => setShowDiePopup(false)}
          onAddNewDie={() => setShowAddDiePopup(true)}
        />
      )}

      {/* Add Die Popup */}
      {showAddDiePopup && (
        <AddDieFormForPopup
          onAddDie={handleAddDieSuccess}
          onClose={() => setShowAddDiePopup(false)}
        />
      )}
    </div>
  );
};

export default DieSection;