import React from 'react';

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string; 
  isInvalid?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({ id, value, onChange, options, placeholder, className, isInvalid, ...props }) => {
  const baseClasses = "block w-full px-4 py-2 text-slate-700 bg-white border rounded-md focus:outline-none sm:text-sm transition duration-150 ease-in-out";
  const normalClasses = "border-slate-300 focus:ring-1 focus:ring-sky-500 focus:border-sky-500";
  const invalidClasses = "border-red-500 ring-1 ring-red-500 focus:border-red-500 focus:ring-red-500";
  
  return (
    <select
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className={`${baseClasses} ${isInvalid ? invalidClasses : normalClasses} ${className || ''}`}
      aria-invalid={isInvalid ? "true" : "false"}
      {...props}
    >
      {/* Ensure placeholder is used if the first option is the placeholder, or if explicitly provided */}
      {options.find(opt => opt.value === "") && !props.required && <option value="" disabled={value !== ""}>{options.find(opt => opt.value === "")?.label || placeholder || "Selecionar opção..."}</option>}
      {options.map(option => {
        // Do not render the placeholder option again if it was handled above, unless it's the only value / non-required context
        if (option.value === "" && !props.required && options.find(opt => opt.value === "")) return null;
        return (
          <option key={option.value} value={option.value} disabled={option.value === "" && props.required}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};

export default SelectInput;
