// import React from 'react';
// import Table from '../../common/Table';
// import ActionButtons from '../../common/ActionButtons';
// import { MATERIAL_TABLE_HEADERS } from '../../../constants/tableHeaders';

// const DisplayMaterialTable = ({ materials, onEdit, onDelete }) => {
//   const renderActions = (material) => (
//     <ActionButtons 
//       item={material.id} 
//       onEdit={() => onEdit(material)} 
//       onDelete={onDelete} 
//     />
//   );

//   return (
//     <div className="bg-white p-6 rounded shadow">
//       <h2 className="text-lg font-bold mb-6">AVAILABLE MATERIALS</h2>
//       <Table 
//         headers={MATERIAL_TABLE_HEADERS}
//         data={materials}
//         renderActions={renderActions}
//         emptyMessage="No materials available. Add a new material to get started."
//       />
//     </div>
//   );
// };

// export default DisplayMaterialTable;

import React from 'react';
import Table from '../../common/Table';
import ActionButtons from '../../common/ActionButtons';
import { MATERIAL_TABLE_HEADERS } from '../../../constants/tableHeaders';

const DisplayMaterialTable = ({ materials, onEdit, onDelete }) => {
  const renderActions = (material) => (
    <ActionButtons 
      item={material.id} 
      onEdit={() => onEdit(material)} 
      onDelete={onDelete} 
    />
  );

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-6">AVAILABLE MATERIALS</h2>
      <Table 
        headers={MATERIAL_TABLE_HEADERS}
        data={materials}
        renderActions={renderActions}
        emptyMessage="No materials available. Add a new material to get started."
      />
    </div>
  );
};

export default DisplayMaterialTable;