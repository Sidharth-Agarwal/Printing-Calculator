import React, { useEffect, useState } from "react";
import ClientInfo from "./ClientInfo";
import OrderInfo from "./OrderInfo";
import PaperInfo from "./PaperInfo";
import DieInfo from "./DieInfo";

// import DieSelectionPopup from "../../components/DieSelectionPopup";
// import AddDieFormForPopup from "../../components/AddDieFormForPopup";
import DieSelectionPopup from "../DieUpdate/DieSelectionPopUp";
import AddDieFormForPopup from "../DieUpdate/AddDieFormPopup";

const OrderAndPaper = ({ state, dispatch }) => {
  const { orderAndPaper } = state;
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ClientInfo 
          clientName={orderAndPaper.clientName}
          projectName={orderAndPaper.projectName}
          dispatch={dispatch}
        />
        
        <OrderInfo 
          date={orderAndPaper.date}
          deliveryDate={orderAndPaper.deliveryDate}
          jobType={orderAndPaper.jobType}
          quantity={orderAndPaper.quantity}
          dispatch={dispatch}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaperInfo 
          paperProvided={orderAndPaper.paperProvided}
          paperName={orderAndPaper.paperName}
          dispatch={dispatch}
        />
        
        <DieInfo 
          dieSelection={orderAndPaper.dieSelection}
          dieCode={orderAndPaper.dieCode}
          dieSize={orderAndPaper.dieSize}
          image={orderAndPaper.image}
          onSelectDie={() => setShowDiePopup(true)}
          dispatch={dispatch}
        />
      </div>
      
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

export default OrderAndPaper;