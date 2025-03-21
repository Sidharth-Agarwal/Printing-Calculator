// import React from 'react';
// import Table from '../../common/Table';
// import ActionButtons from '../../common/ActionButtons';
// import { STANDARD_RATE_TABLE_HEADERS } from '../../../constants/tableHeaders';

// const DisplayStandardRateTable = ({ rates, onDelete, onEdit }) => {
//   const renderActions = (rate) => (
//     <ActionButtons 
//       item={rate.id} 
//       onEdit={() => onEdit(rate)} 
//       onDelete={onDelete} 
//     />
//   );

//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-lg font-medium mb-6">STANDARD RATES</h2>
//       <Table 
//         headers={STANDARD_RATE_TABLE_HEADERS}
//         data={rates}
//         renderActions={renderActions}
//         emptyMessage="No standard rates available. Add a new rate to get started."
//       />
//     </div>
//   );
// };

// export default DisplayStandardRateTable;

import React from 'react';
import Table from '../../common/Table';
import ActionButtons from '../../common/ActionButtons';
import { STANDARD_RATE_TABLE_HEADERS } from '../../../constants/tableHeaders';

const DisplayStandardRateTable = ({ rates, onDelete, onEdit }) => {
  const renderActions = (rate) => (
    <ActionButtons 
      item={rate} 
      onEdit={() => onEdit(rate)} 
      onDelete={() => onDelete(rate.id)} 
    />
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-medium mb-6">STANDARD RATES</h2>
      <Table 
        headers={STANDARD_RATE_TABLE_HEADERS}
        data={rates}
        renderActions={renderActions}
        emptyMessage="No standard rates available. Add a new rate to get started."
      />
    </div>
  );
};

export default DisplayStandardRateTable;