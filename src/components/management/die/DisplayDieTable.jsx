// import React from 'react';
// import Table from '../../common/Table';
// import ActionButtons from '../../common/ActionButtons';
// import { DIE_TABLE_HEADERS } from '../../../constants/tableHeaders';

// const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
//   const renderActions = (die) => (
//     <ActionButtons 
//       item={die} 
//       onEdit={onEditDie} 
//       onDelete={onDeleteDie} 
//     />
//   );

//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-lg font-medium mb-6">AVAILABLE DIES</h2>
//       <Table 
//         headers={DIE_TABLE_HEADERS}
//         data={dies}
//         renderActions={renderActions}
//         emptyMessage="No dies available. Add a new die to get started."
//       />
//     </div>
//   );
// };

// export default DisplayDieTable;

import React from 'react';
import Table from '../../common/Table';
import ActionButtons from '../../common/ActionButtons';
import { DIE_TABLE_HEADERS } from '../../../constants/tableHeaders';

const DisplayDieTable = ({ dies, onEditDie, onDeleteDie }) => {
  const renderActions = (die) => (
    <ActionButtons 
      item={die} 
      onEdit={onEditDie} 
      onDelete={() => onDeleteDie(die.id)} 
    />
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-6">AVAILABLE DIES</h2>
      <Table 
        headers={DIE_TABLE_HEADERS}
        data={dies}
        renderActions={renderActions}
        emptyMessage="No dies available. Add a new die to get started."
      />
    </div>
  );
};

export default DisplayDieTable;