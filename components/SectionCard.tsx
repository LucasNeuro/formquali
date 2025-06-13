import React from 'react';

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string; // Added id prop
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, className = '', id }) => {
  return (
    <div id={id} className={`bg-white shadow-md rounded-lg p-6 md:p-8 ${className}`}>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 border-b pb-3 border-slate-200">{title}</h2>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default SectionCard;