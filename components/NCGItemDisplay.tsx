import React from 'react';
import { NcgItemData, RatingOption } from '../types';
import { NCG_RATING_OPTIONS } from '../constants';
import FormField from './FormField';
import RadioGroupInput from './RadioGroupInput';
import TextAreaInput from './TextAreaInput';

interface NCGItemDisplayProps {
  id: string;
  question: string;
  data: NcgItemData;
  onChange: (field: keyof NcgItemData, value: string | RatingOption.CONFORME | RatingOption.NAO_CONFORME | null) => void;
  isInvalid?: boolean;
}

const NCGItemDisplay: React.FC<NCGItemDisplayProps> = ({ id, question, data, onChange, isInvalid }) => {
  return (
    <div id={id} className={`p-4 border rounded-lg ${isInvalid ? 'border-red-400 bg-red-50/70' : 'border-red-200 bg-red-50/50'}`}>
      <FormField label={question} htmlFor={`${id}-occurred`} required>
        <RadioGroupInput
          name={`${id}-occurred`}
          options={NCG_RATING_OPTIONS}
          selectedValue={data.occurred}
          onChange={(value) => onChange('occurred', value as RatingOption.CONFORME | RatingOption.NAO_CONFORME)} 
          isInvalid={isInvalid && data.occurred === null} // Pass invalid state only if occurred is null
        />
      </FormField>
      <FormField label="Justificativa:" htmlFor={`${id}-justification`} className="mt-3">
        <TextAreaInput
          id={`${id}-justification`}
          value={data.justification}
          onChange={(e) => onChange('justification', e.target.value)}
          placeholder="Detalhes da ocorrência NCG..."
        />
      </FormField>
    </div>
  );
};

export default NCGItemDisplay;
