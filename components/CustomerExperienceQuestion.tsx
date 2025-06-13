import React from 'react';
import { RatingOption } from '../types';
import { NCG_RATING_OPTIONS, YES_NO_SELECT_OPTIONS, YES_NO_NA_SELECT_OPTIONS } from '../constants';
import FormField from './FormField';
import RadioGroupInput from './RadioGroupInput';
import TextInput from './TextInput';
import SelectInput from './SelectInput';

interface CustomerExperienceQuestionProps {
  id: string;
  label: string;
  type: 'radio' | 'text' | 'select';
  value: RatingOption.CONFORME | RatingOption.NAO_CONFORME | string | null;
  onChange: (value: RatingOption.CONFORME | RatingOption.NAO_CONFORME | string | null) => void;
  required?: boolean;
  selectOptions?: Array<{ value: string; label: string }>;
  inputClassName?: string;
  isInvalid?: boolean;
}

const CustomerExperienceQuestion: React.FC<CustomerExperienceQuestionProps> = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  required = true, 
  selectOptions = [],
  inputClassName = '',
  isInvalid
}) => {
  
  let currentSelectOptions: Array<{ value: string; label: string }> = [];
  if (type === 'select') {
    if (selectOptions && selectOptions.length > 0) {
      currentSelectOptions = selectOptions;
    } else { // Infer options if not provided explicitly (example for common cases)
      if (label.includes("Houve tentativa de reverter a imagem negativa?") || label.includes("Cliente verbalizou insatisfação com a IA?")) {
        currentSelectOptions = YES_NO_NA_SELECT_OPTIONS;
      } else {
        currentSelectOptions = YES_NO_SELECT_OPTIONS;
      }
    }
  }


  return (
    <FormField label={label} htmlFor={id} required={required}>
      {type === 'radio' ? (
        <RadioGroupInput
          name={id}
          options={NCG_RATING_OPTIONS} 
          selectedValue={value as RatingOption.CONFORME | RatingOption.NAO_CONFORME | null}
          onChange={(val) => onChange(val as RatingOption.CONFORME | RatingOption.NAO_CONFORME)}
          isInvalid={isInvalid}
        />
      ) : type === 'select' ? (
        <SelectInput
          id={id}
          value={value as string || ""} // Ensure value is not null for select
          onChange={(e) => onChange(e.target.value)}
          options={currentSelectOptions}
          required={required}
          className={inputClassName}
          isInvalid={isInvalid}
        />
      ) : (
        <TextInput
          id={id}
          value={value as string || ""}  // Ensure value is not null
          onChange={(e) => onChange(e.target.value)}
          placeholder="Descreva..."
          required={required}
          className={inputClassName}
          isInvalid={isInvalid}
        />
      )}
    </FormField>
  );
};

export default CustomerExperienceQuestion;
