import React, { useRef, useEffect } from "react";
import FormGroup from "../../containers/FormGroup";

const ClientInfo = ({ clientName, projectName, dispatch }) => {
  const firstInputRef = useRef(null);

  // Focus on the first input field when the component loads
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: { [name]: value }
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Client Information</h3>
      <div className="space-y-4">
        <FormGroup 
          label="Client Name" 
          htmlFor="clientName"
          required
        >
          <input
            id="clientName"
            name="clientName"
            type="text"
            ref={firstInputRef}
            value={clientName || ""}
            onChange={handleChange}
            placeholder="Enter client name"
            className="border rounded-md p-2 w-full text-xs"
            required
          />
        </FormGroup>

        <FormGroup 
          label="Project Name" 
          htmlFor="projectName"
          required
        >
          <input
            id="projectName"
            name="projectName"
            type="text"
            value={projectName || ""}
            onChange={handleChange}
            placeholder="Enter project name"
            className="border rounded-md p-2 w-full text-xs"
            required
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default ClientInfo;