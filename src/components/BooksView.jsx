import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert } from './Alert';
import { 
  Book as BookIcon, Search, Plus, Filter, Trash2, Edit2, 
  Upload, X, Check, BookOpen, AlertTriangle 
} from 'lucide-react';

export function BooksView({ userRole }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showCoverModal, setShowCoverModal] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category_id: '',
    total_copies: 1,
  });
  const [coverFile, setCoverFile] = useState(null);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (q) params.q = q;
      if (selectedCategory) params.category_id = selectedCategory;
      params.size = 50;

      const data = await api.getBooks(params);
      setBooks(data.items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createBook({
        ...formData,
        total_copies: parseInt(formData.total_copies, 10),
      });
      setShowCreateModal(false);
      setFormData({ title: '', author: '', isbn: '', category_id: '', total_copies: 1 });
      setSuccess('Libro creado exitosamente en el catálogo.');
      loadBooks();
    } catch (err) {
      setError(err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.updateBook(showEditModal.id, {
        title: showEditModal.title,
        author: showEditModal.author,
        category_id: showEditModal.category.id,
        total_copies: parseInt(showEditModal.total_copies, 10),
      });
      setShowEditModal(null);
      setSuccess('Libro actualizado correctamente.');
      loadBooks();
    } catch (err) {
      setError(err);
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`¿Seguro que deseas dar de baja el libro «${book.title}»? (Baja lógica)`)) {
      return;
    }
    setError(null);
    try {
      await api.deleteBook(book.id);
      setSuccess(`El libro «${book.title}» fue dado de baja correctamente.`);
      loadBooks();
    } catch (err) {
      setError(err);
    }
  };

  const handleUploadCover = async (e) => {
    e.preventDefault();
    if (!coverFile) return;

    setError(null);
    const fd = new FormData();
    fd.append('file', coverFile);

    try {
      await api.uploadCover(showCoverModal.id, fd);
      setShowCoverModal(null);
      setCoverFile(null);
      setSuccess('Portada actualizada exitosamente.');
      loadBooks();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo de Libros</h2>
          <p className="text-sm text-slate-500 mt-1">
            Consulta de ejemplares y control de disponibilidad en tiempo real.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setFormData({
                title: '',
                author: '',
                isbn: '',
                category_id: categories[0]?.id || '',
                total_copies: 1,
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Libro
          </button>
        )}
      </div>

      <Alert error={error} message={success} onClose={() => { setError(null); setSuccess(''); }} />

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table or Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Cargando catálogo...</div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500">
          No se encontraron libros en el catálogo con los filtros aplicados.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Portada</th>
                  <th className="py-3.5 px-4">Título y Autor</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4 text-center">Disponibilidad</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4">
                      {b.cover_key ? (
                        <img
                          src={api.getCoverUrl(b.id)}
                          alt={b.title}
                          className="w-10 h-14 object-cover rounded shadow-sm border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400 border border-slate-200">
                          <BookIcon className="w-5 h-5" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.title}</div>
                      <div className="text-xs text-slate-500">{b.author}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">{b.isbn}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                        {b.category?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-1 rounded-full border">
                        {b.available_copies > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full">
                            {b.available_copies} de {b.total_copies} disponibles
                          </span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 border-rose-200 px-2 py-0.5 rounded-full">
                            Agotado ({b.total_copies} prestados)
                          </span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setShowCoverModal(b)}
                            title="Subir portada"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowEditModal(b)}
                            title="Editar libro"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            title="Dar de baja"
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Agregar Libro al Catálogo</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ej: Cien años de soledad"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Autor</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="ej: Gabriel García Márquez"
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ISBN (13 dígitos)</label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    pattern="[0-9]{13}"
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="9780307474728"
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ejemplares Totales</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.total_copies}
                    onChange={(e) => setFormData({ ...formData, total_copies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Seleccione una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                >
                  Guardar Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Editar Libro</h3>
              <button onClick={() => setShowEditModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={showEditModal.title}
                  onChange={(e) => setShowEditModal({ ...showEditModal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Autor</label>
                <input
                  type="text"
                  required
                  value={showEditModal.author}
                  onChange={(e) => setShowEditModal({ ...showEditModal, author: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Total de Ejemplares</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={showEditModal.total_copies}
                    onChange={(e) => setShowEditModal({ ...showEditModal, total_copies: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
                  <select
                    required
                    value={showEditModal.category.id}
                    onChange={(e) => setShowEditModal({ 
                      ...showEditModal, 
                      category: { id: e.target.value, name: categories.find(c => c.id === e.target.value)?.name } 
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 border text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Cover Modal */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900">Subir Portada</h3>
              <button onClick={() => setShowCoverModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Formato permitido: JPG o PNG. Tamaño máximo: 2 MB.
            </p>
            <form onSubmit={handleUploadCover} className="space-y-4">
              <input
                type="file"
                accept="image/jpeg,image/png"
                required
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCoverModal(null)}
                  className="px-4 py-2 border text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm"
                >
                  Subir Portada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
