import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert } from './Alert';
import { AlertOctagon, RotateCcw, Calendar, User, BookOpen } from 'lucide-react';

export function OverdueView() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadOverdue();
  }, []);

  const loadOverdue = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOverdue();
      setItems(data.items || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId, itemId, bookTitle) => {
    if (!window.confirm(`¿Registrar devolución de «${bookTitle}»?`)) return;
    setError(null);
    try {
      await api.returnItem(loanId, itemId);
      setSuccess(`Libro «${bookTitle}» devuelto con éxito.`);
      loadOverdue();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Libros Vencidos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Líneas de préstamo sin devolver cuya fecha límite ha expirado (ordenado por días de retraso).
          </p>
        </div>
        <button
          onClick={loadOverdue}
          className="px-3.5 py-2 border bg-white rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 shadow-sm transition"
        >
          Actualizar Lista
        </button>
      </div>

      <Alert error={error} message={success} onClose={() => { setError(null); setSuccess(''); }} />

      {loading ? (
        <div className="p-12 text-center text-slate-400">Consultando libros vencidos...</div>
      ) : items.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            ✓
          </div>
          <p className="font-semibold text-slate-800">¡Al día!</p>
          <p className="text-xs text-slate-400 mt-1">No hay préstamos con fecha vencida pendientes de devolución.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-rose-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-rose-50/70 border-b border-rose-100 flex items-center gap-2 text-rose-800 text-sm font-semibold">
            <AlertOctagon className="w-4 h-4 text-rose-600" />
            Total de {items.length} libros con retraso pendiente de entrega
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Libro</th>
                  <th className="py-3.5 px-4">Socio Responsable</th>
                  <th className="py-3.5 px-4">Fecha Límite</th>
                  <th className="py-3.5 px-4 text-center">Retraso</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row) => (
                  <tr key={row.item_id} className="hover:bg-rose-50/20 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      {row.book_title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {row.member_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                      {new Date(row.due_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full border border-rose-200">
                        {row.days_late} {row.days_late === 1 ? 'día' : 'días'} tarde
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleReturn(row.loan_id, row.item_id, row.book_title)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Devolver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
