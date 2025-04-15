import React from "react";

const VersionDropdown = ({ versions, selectedVersion, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <select
        value={selectedVersion}
        onChange={handleChange}
        className="block w-full bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">-- Select a Version --</option>
        {versions.map((version) => (
          <option key={version.id} value={version.id}>
            Version {version.id} ({version.count} Estimate{version.count !== 1 ? 's' : ''})
          </option>
        ))}
      </select>
    </div>
  );
};

export default VersionDropdown;