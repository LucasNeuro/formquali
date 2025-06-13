import React from 'react';
import { FormData } from '../types';
import AIAssistant from './AIAssistant';

export interface ProgressSection {
  id: string;
  title: string;
  isComplete: boolean;
}

interface SideOverProgressProps {
  sections: ProgressSection[];
  onSectionClick: (id: string) => void;
  currentSectionId?: string; // Optional: to highlight the currently active/viewed section
  headerHeight?: number; // Optional: to adjust top position if header height is dynamic
  formData: FormData; // Add formData to pass to the AI assistant
}

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 0 0-1.06 1.06L9.97 13.28l3.64-3.64Z" clipRule="evenodd" />
  </svg>
);

const CircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


const SideOverProgress: React.FC<SideOverProgressProps> = ({ sections, onSectionClick, headerHeight = 80, formData }) => {
  return (
    <aside
      className="w-50 h-full pr-4 bg-white shadow-2xl rounded-l-2xl border-l border-slate-200 flex flex-col items-stretch transition-all duration-300 ease-in-out"
      aria-label="Progresso do Formulário"
    >
      <div className="overflow-y-auto py-8 px-4 h-full">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Progresso</h3>
        <nav>
          <ul className="space-y-1 relative">
            {sections.map((section, index) => (
              <li key={section.id} className="sideover-progress-item relative pl-2">
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={`flex items-center w-full text-left py-2 px-3 rounded-md transition-colors duration-150 ease-in-out group
                              ${section.isComplete ? 'text-green-600 hover:bg-green-50' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {section.isComplete ? (
                    <CheckCircleIcon className="w-6 h-6 mr-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <CircleIcon className="w-6 h-6 mr-3 text-slate-400 group-hover:text-amber-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <AIAssistant formData={formData} />
      </div>
    </aside>
  );
};

export default SideOverProgress;
