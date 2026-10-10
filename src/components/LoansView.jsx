import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert } from './Alert';
import { 
  BookMarked, Plus, Search, RotateCcw, CheckCircle2, 
  Clock, AlertCircle, Trash2, Calendar, User, X 
} from 'lucide-react';

export function LoansView() {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Create Loan state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState(['']);
  const [modalError, setModalError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loansData, membersData, booksData] = await Promise.all([
        api.getLoans({ status: statusFilter, size: 50 }),
        api.getMembers({ size: 100 }),
        api.getBooks({ size: 100 }),
      ]);
      setLoans(loansData.items);
      setMembers(membersData.items);
      setBooks(booksData.items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookSlot = () => {
    if (selectedBookIds.length < 3) {
      setSelectedBookIds([...selectedBookIds, '']);
    }
  };

  const handleRemoveBookSlot = (index) => {
    if (selectedBookIds.length > 1) {
      const updated = [...selectedBookIds];
      updated.splice(index, 1);
      setSelectedBookIds(updated);
    }
  };

  const handleBookChange = (index, value) => {
    const updated = [...selectedBookIds];
    updated[index] = value;
    setSelectedBookIds(updated);
  };

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    setModalError(null);

    const validBookIds = selectedBookIds.filter(Boolean);
    if (validBookIds.length === 0) {
      setModalError({ message: 'Debe seleccionar al menos un libro para el préstamo.' });
      return;
    }

    setSubmitting(true);
    try {
      await api.createLoan({
        member_id: selectedMemberId,
        items: validBookIds.map((bId) => ({ book_id: bId })),
      });
      setShowCreateModal(false);
      setSelectedMemberId('');
      setSelectedBookIds(['']);
      setModalError(null);
      setSuccess('Préstamo registrado exitosamente.');
      loadData();
    } catch (err) {
      setModalError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnItem = async (loanId, itemId, bookTitle) => {
    if (!window.confirm(`¿Confirmar devolución del ejemplar «${bookTitle}»?`)) {
      return;
    }
    setError(null);
    try {
      await api.returnItem(loanId, itemId);
      setSuccess(`Ejemplar «${bookTitle}» devuelto con éxito.`);
      loadData();
    } catch (err) {
      setError(err);
    }
  };

  // Helper to find member details
  const getMemberDetails = (memberId) => {
    return members.find((m) => m.id === memberId);
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Préstamos y Devoluciones</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestión atómica de préstamos (1 a 3 libros por socio) y devoluciones por línea.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedMemberId(members[0]?.id || '');
            setSelectedBookIds(['']);
            setModalError(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          Registrar Préstamo
        </button>
      </div>

      <Alert error={error} message={success} onClose={() => { setError(null); setSuccess(''); }} />

      {/* Filter by status */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-3 items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase">Filtrar por Estado:</span>
        <div className="flex gap-1.5">
          {['', 'open', 'overdue', 'closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'Todos' : st === 'open' ? 'Abiertos' : st === 'overdue' ? 'Vencidos' : 'Cerrados'}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Cargando préstamos...</div>
      ) : loans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          No hay préstamos registrados con el estado seleccionado.
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const member = getMemberDetails(loan.member_id);
            const isClosed = loan.status === 'closed';
            const isOverdue = loan.status === 'overdue';

            return (
              <div key={loan.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <BookMarked className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center gap-2">
                        {member?.full_name || 'Socio'}
                        <span className="font-mono text-xs text-slate-400 font-normal">
                          (Doc: {member?.document_number})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Fecha préstamo: {new Date(loan.loaned_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      isClosed
                        ? 'bg-slate-100 text-slate-700'
                        : isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isClosed ? <CheckCircle2 className="w-3.5 h-3.5" /> : isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {isClosed ? 'Cerrado' : isOverdue ? 'Vencido' : 'Abierto'}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Líneas de Préstamo ({loan.items?.length || 0}):
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {loan.items?.map((item) => {
                      const isReturned = item.returned_at !== null;
                      const isItemOverdue = !isReturned && new Date(item.due_at) < new Date();

                      return (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border flex flex-col sm:flex-row justify-between sm:items-center gap-2 ${
                            isReturned 
                              ? 'bg-slate-50/70 border-slate-200 text-slate-500' 
                              : isItemOverdue 
                              ? 'bg-rose-50/40 border-rose-200' 
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div>
                            <div className={`font-medium text-sm ${isReturned ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.book_title}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5 font-mono">
                              <span>ISBN: {item.isbn}</span>
                              <span className="font-sans px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                                {item.category_name}
                              </span>
                              <span>Vence: {new Date(item.due_at).toLocaleDateString()}</span>
                              {isReturned && (
                                <span className="text-emerald-700 font-sans font-medium">
                                  ✓ Devuelto: {new Date(item.returned_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>

                          {!isReturned && (
                            <button
                              onClick={() => handleReturnItem(loan.id, item.id, item.book_title)}
                              className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Devolver Ejemplar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Loan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Registrar Nuevo Préstamo</h3>
              <button 
                onClick={() => { setShowCreateModal(false); setModalError(null); }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{modalError.message || 'Error al procesar el préstamo'}</p>
                  {modalError.details && modalError.details.length > 0 && (
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-rose-700">
                      {modalError.details.map((d, i) => (
                        <li key={i}>
                          {d.field ? <span className="font-mono font-medium">{d.field}: </span> : null}
                          {d.issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Seleccionar Socio</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    setModalError(null);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccione un socio</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} (Doc: {m.document_number} — {m.active_loans} activos{m.has_overdue ? ' — ⚠️ CON MORA' : ''})
                    </option>
                  ))}
                </select>
                {selectedMember && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-500">
                      Préstamos sin devolver: <span className="font-semibold text-indigo-600">{selectedMember.active_loans} de 3 máx</span>.
                    </p>
                    {selectedMember.has_overdue && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Este socio tiene libros vencidos pendientes. Debe devolverlos antes de solicitar nuevos préstamos.</span>
                      </div>
                    )}
                    {!selectedMember.has_overdue && selectedMember.active_loans >= 3 && (
                      <span className="text-rose-600 font-semibold block text-xs">
                        ⚠️ Este socio ha alcanzado el límite máximo de 3 libros.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Libros a Prestar (de 1 a 3 líneas)
                  </label>
                  {selectedBookIds.length < 3 && (
                    <button
                      type="button"
                      onClick={handleAddBookSlot}
                      className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar otro libro
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {selectedBookIds.map((bId, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        required
                        value={bId}
                        onChange={(e) => handleBookChange(idx, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Seleccionar libro #{idx + 1}</option>
                        {books.map((b) => (
                          <option 
                            key={b.id} 
                            value={b.id}
                            disabled={b.available_copies <= 0}
                          >
                            {b.title} — {b.available_copies > 0 ? `${b.available_copies} disponibles` : 'AGOTADO'}
                          </option>
                        ))}
                      </select>
                      {selectedBookIds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBookSlot(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <div>• Plazo de devolución: <strong>14 días</strong> a partir de hoy.</div>
                <div>• Congelará título, ISBN y categoría en el momento del préstamo.</div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setModalError(null); }}
                  className="px-4 py-2 border text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || selectedMember?.has_overdue || selectedMember?.active_loans >= 3}
                  className="px-4 py-2 bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition flex items-center gap-2"
                >
                  {submitting && <Clock className="w-3.5 h-3.5 animate-spin" />}
                  {submitting ? 'Confirmando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
