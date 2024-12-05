const EditableField = ({ label, value, isEditing, onChange }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}:</label>
      {isEditing ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="border rounded-md p-2 w-full"
        />
      ) : (
        <p className="text-sm text-gray-700">{value || "N/A"}</p>
      )}
    </div>
  );
  
  export default EditableField;
  