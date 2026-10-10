import React, { useState } from 'react';
import { api } from '../api/client';
import { Alert } from './Alert';
import { UserPlus, Shield, CheckCircle2 } from 'lucide-react';

export function LibrariansView() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess('');

    try {
      const data = await api.createLibrarian({ username, password });
      setSuccess(`Bibliotecario «${data.username}» creado exitosamente con rol librarian.`);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Alta de Bibliotecarios</h2>
        <p className="text-sm text-slate-500 mt-1">
          Creación de cuentas para el personal operativo (solo rol librarian, según HU-02).
        </p>
      </div>

      <Alert error={error} message={success} onClose={() => { setError(null); setSuccess(''); }} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de Usuario</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ej: ana_garcia"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Se normalizará automáticamente a minúsculas y sin espacios.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña Inicial</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Rol Asignado</label>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span><strong>librarian</strong> (Rol operativo estándar fijado por norma)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creando cuenta...' : 'Crear Bibliotecario'}
          </button>
        </form>
      </div>
    </div>
  );
}
