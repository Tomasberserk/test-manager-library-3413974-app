import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert } from './Alert';
import { UserPlus, Shield, Users, CheckCircle2, KeyRound, UserCheck } from 'lucide-react';

export function LibrariansView() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await api.getUsers();
      setUsers(data.items || []);
    } catch (err) {
      console.error('Error al cargar lista de usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess('');

    try {
      const data = await api.createLibrarian({ username, password });
      setSuccess(`Bibliotecario «${data.username}» dado de alta exitosamente con rol librarian.`);
      setUsername('');
      setPassword('');
      loadUsers();
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Personal y Alta de Bibliotecarios</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestión de accesos y creación de cuentas operativas para el personal bibliotecario (según HU-02).
        </p>
      </div>

      <Alert error={error} message={success} onClose={() => { setError(null); setSuccess(''); }} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulario de Alta */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Dar de Alta Bibliotecario</h3>
              <p className="text-xs text-slate-500">Crea credenciales con rol restringido</p>
            </div>
          </div>

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
                Se guardará automáticamente en minúsculas y sin espacios (CA-02.2).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña Inicial</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                La contraseña se cifra con hash seguro y nunca se devuelve en respuestas (CA-02.3).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Rol Asignado</label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span><strong>librarian</strong> (Fijado por norma HU-02)</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Registrando...' : 'Dar de Alta Bibliotecario'}
            </button>
          </form>
        </div>

        {/* Tabla de Usuarios Registrados */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Usuarios Dados de Alta</h3>
                <p className="text-xs text-slate-500">{users.length} cuenta(s) registradas en el sistema</p>
              </div>
            </div>
            <button
              onClick={loadUsers}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
            >
              Actualizar
            </button>
          </div>

          {loadingUsers ? (
            <div className="p-8 text-center text-sm text-slate-400">Cargando personal...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No hay usuarios dados de alta aún.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                    <th className="px-6 py-3.5">Usuario</th>
                    <th className="px-6 py-3.5">Rol</th>
                    <th className="px-6 py-3.5">Fecha de Alta</th>
                    <th className="px-6 py-3.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{u.username}</span>
                            <span className="text-xs text-slate-400">ID: {u.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('es-CO', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'Semilla inicial'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Activo
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
