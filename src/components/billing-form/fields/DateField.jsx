import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateField = ({
  id,
  selected,
  onChange,
  dateFormat = "dd/MM/yyyy",
  placeholderText = "DD/MM/YYYY",
  className = "",
  required = false
}) => {
  // Custom styles for the datepicker to make it smaller
  const customDatePickerStyles = `
    .react-datepicker {
      font-size: 0.8rem;
      width: 200px;
    }
    .react-datepicker__month-container {
      width: 200px;
    }
    .react-datepicker__day {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__day-name {
      width: 1.5rem;
      line-height: 1.5rem;
      margin: 0.1rem;
    }
    .react-datepicker__header {
      padding-top: 0.5rem;
    }
    .react-datepicker__current-month {
      font-size: 0.9rem;
    }
  `;

  return (
    <>
      <style>{customDatePickerStyles}</style>
      <DatePicker
        id={id}
        selected={selected}
        onChange={onChange}
        dateFormat={dateFormat}
        placeholderText={placeholderText}
        className={`border rounded-md p-2 w-full text-xs ${className}`}
        required={required}
        popperClassName="small-calendar"
        calendarClassName="small-calendar"
      />
    </>
  );
};

export default DateField;