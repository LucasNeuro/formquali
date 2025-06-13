
import React from 'react';
import { ChecklistItemData, RatingOption } from '../types';
import { POSITIVE_RATING_OPTIONS } from '../constants';
import FormField from './FormField';
import RadioGroupInput from './RadioGroupInput';
import TextAreaInput from './TextAreaInput';

interface ChecklistItemDisplayProps {
  id: string;
  question: string;
  data: ChecklistItemData;
  onChange: (field: keyof ChecklistItemData, value: string | RatingOption | null) => void;
  isInvalid?: boolean;
}

const ChecklistItemDisplay: React.FC<ChecklistItemDisplayProps> = ({ id, question, data, onChange, isInvalid }) => {
  return (
    <div id={id} className={`p-4 border rounded-lg ${isInvalid ? 'border-red-400 bg-red-50/70' : 'border-slate-200 bg-slate-50/50'}`}>
      <FormField label={question} htmlFor={`${id}-rating`} required>
        <RadioGroupInput
          name={`${id}-rating`}
          options={POSITIVE_RATING_OPTIONS}
          selectedValue={data.rating}
          onChange={(value) => onChange('rating', value)}
          isInvalid={isInvalid && data.rating === null} // Pass invalid state only if rating is null
        />
      </FormField>
      <FormField label="Justificativa:" htmlFor={`${id}-justification`} className="mt-3">
        <TextAreaInput
          id={`${id}-justification`}
          value={data.justification}
          onChange={(e) => onChange('justification', e.target.value)}
          placeholder="Detalhes da avaliação..."
        />
      </FormField>
    </div>
  );
};

export default ChecklistItemDisplay;
