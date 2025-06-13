import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onLogout }) => {
  return (
    <header className="bg-white text-slate-800 p-6 shadow-sm border-b border-slate-200 flex items-center justify-between">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-500 text-lg">{subtitle}</p>}
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="ml-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300 font-medium transition"
          >
            Sair
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
