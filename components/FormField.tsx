
import React from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, children, className = '', required = false }) => {
  return (
    <div className={`form-field-parent flex flex-col space-y-2 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};

export default FormField;
