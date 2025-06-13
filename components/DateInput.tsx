import React from 'react';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isInvalid?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ id, value, onChange, isInvalid, ...props }) => {
  const baseClasses = "block w-full px-4 py-2 text-slate-700 bg-white border rounded-md focus:outline-none sm:text-sm transition duration-150 ease-in-out";
  const normalClasses = "border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500";
  const invalidClasses = "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500";
  
  return (
    <input
      type="date"
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${isInvalid ? invalidClasses : normalClasses}`}
      aria-invalid={isInvalid ? "true" : "false"}
      {...props}
    />
  );
};

export default DateInput;
