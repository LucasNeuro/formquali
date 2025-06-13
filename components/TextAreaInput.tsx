import React from 'react';

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, value, onChange, ...props }) => {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      rows={3}
      className="block w-full px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out sm:text-sm"
      {...props}
    />
  );
};

export default TextAreaInput;
