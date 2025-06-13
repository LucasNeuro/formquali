import React from 'react';
import { RatingOption } from '../types';

interface RadioGroupInputProps {
  name: string;
  options: ReadonlyArray<RatingOption>; 
  selectedValue: RatingOption | null;
  onChange: (value: RatingOption) => void;
  legend?: string;
  required?: boolean;
  isInvalid?: boolean;
}

const RadioGroupInput: React.FC<RadioGroupInputProps> = ({ name, options, selectedValue, onChange, legend, required, isInvalid }) => {
  const fieldsetBaseClasses = "mt-1 p-2 rounded-md transition-colors duration-150";
  const fieldsetNormalClasses = "border border-transparent"; // Normal state has no visible border unless wrapped
  const fieldsetInvalidClasses = "border border-red-500 ring-1 ring-red-500 bg-red-50/50";
  
  return (
    <fieldset className={`${fieldsetBaseClasses} ${isInvalid ? fieldsetInvalidClasses : fieldsetNormalClasses}`}>
      {legend && <legend className="text-sm font-medium text-slate-700 mb-1">{legend}{required && <span className="text-red-500 ml-1">*</span>}</legend>}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-center">
            <input
              id={`${name}-${option}`}
              name={name}
              type="radio"
              value={option}
              checked={selectedValue === option}
              onChange={() => onChange(option)}
              className="focus:ring-amber-500 h-4 w-4 text-amber-600 border-slate-300"
              aria-invalid={isInvalid ? "true" : "false"}
            />
            <label htmlFor={`${name}-${option}`} className="ml-2 block text-sm text-slate-700">
              {option}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroupInput;
