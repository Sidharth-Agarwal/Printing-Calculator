import React from "react";
import FormGroup from "../../containers/FormGroup";
import DateField from "../../fields/DateField";
import SelectField from "../../fields/SelectField";
import NumberField from "../../fields/NumberField";

const JOB_TYPES = [
  "Card",
  "Biz Card",
  "Vellum Jacket",
  "Envelope",
  "Tag",
  "Magnet"
];

const OrderInfo = ({ date, deliveryDate, jobType, quantity, dispatch }) => {
  const handleDateChange = (field, date) => {
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: { [field]: date }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch({
      type: "UPDATE_ORDER_AND_PAPER",
      payload: { [name]: name === "quantity" ? Math.max(0, value) : value }
    });
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Order Information</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormGroup 
            label="Date" 
            htmlFor="date"
            required
          >
            <DateField
              id="date"
              selected={date}
              onChange={(date) => handleDateChange("date", date)}
              required
            />
          </FormGroup>

          <FormGroup 
            label="Delivery Date" 
            htmlFor="deliveryDate"
            required
          >
            <DateField
              id="deliveryDate"
              selected={deliveryDate}
              onChange={(date) => handleDateChange("deliveryDate", date)}
              required
            />
          </FormGroup>
        </div>

        <FormGroup 
          label="Job Type" 
          htmlFor="jobType"
          required
        >
          <SelectField
            id="jobType"
            name="jobType"
            value={jobType}
            onChange={handleChange}
            options={JOB_TYPES}
            placeholder="Select job type"
            required
          />
        </FormGroup>

        <FormGroup 
          label="Quantity" 
          htmlFor="quantity"
          required
        >
          <NumberField
            id="quantity"
            name="quantity"
            value={quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            min={1}
            required
          />
        </FormGroup>
      </div>
    </div>
  );
};

export default OrderInfo;