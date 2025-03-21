// import React from 'react';
// import Table from '../../common/Table';
// import ActionButtons from '../../common/ActionButtons';
// import { PAPER_TABLE_HEADERS } from '../../../constants/tableHeaders';

// const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
//   const renderActions = (paper) => (
//     <ActionButtons 
//       item={paper} 
//       onEdit={onEditPaper} 
//       onDelete={onDeletePaper} 
//     />
//   );

//   // Process data to format dates
//   const processedPapers = papers.map(paper => {
//     const formattedPaper = { ...paper };
    
//     // Format timestamp if it exists
//     if (paper.timestamp?.seconds) {
//       formattedPaper.date = new Date(paper.timestamp.seconds * 1000).toLocaleDateString();
//     } else {
//       formattedPaper.date = 'N/A';
//     }
    
//     return formattedPaper;
//   });

//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-lg font-medium mb-6">AVAILABLE PAPERS</h2>
//       <Table 
//         headers={PAPER_TABLE_HEADERS}
//         data={processedPapers}
//         renderActions={renderActions}
//         emptyMessage="No papers available. Add a new paper to get started."
//       />
//     </div>
//   );
// };

// export default DisplayPaperTable;

import React from 'react';
import Table from '../../common/Table';
import ActionButtons from '../../common/ActionButtons';
import { PAPER_TABLE_HEADERS } from '../../../constants/tableHeaders';

const DisplayPaperTable = ({ papers, onEditPaper, onDeletePaper }) => {
  const renderActions = (paper) => (
    <ActionButtons 
      item={paper} 
      onEdit={onEditPaper} 
      onDelete={() => onDeletePaper(paper.id)} 
    />
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-6">AVAILABLE PAPERS</h2>
      <Table 
        headers={PAPER_TABLE_HEADERS}
        data={papers}
        renderActions={renderActions}
        emptyMessage="No papers available. Add a new paper to get started."
      />
    </div>
  );
};

export default DisplayPaperTable;