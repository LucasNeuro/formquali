import React, { useState } from 'react';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<void>;
  error: string | null;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, error, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-800 text-center">Login</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block text-slate-700 font-medium mb-1">Usuário</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-slate-700 font-medium mb-1">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <p className="mb-4 text-red-600 text-sm bg-red-100 p-2 rounded">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-md transition"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login; 