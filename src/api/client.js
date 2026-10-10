const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(data, status) {
    super(data.message || 'Error en la petición');
    this.code = data.code || 'UNKNOWN_ERROR';
    this.details = data.details || [];
    this.status = status;
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData vs JSON
  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    body,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(data, response.status);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),

  // Health
  health: () => apiRequest('/health'),

  // Categories
  getCategories: () => apiRequest('/categories'),

  // Books
  getBooks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/books${q ? `?${q}` : ''}`);
  },
  getBook: (id) => apiRequest(`/books/${id}`),
  createBook: (book) =>
    apiRequest('/books', {
      method: 'POST',
      body: book,
    }),
  updateBook: (id, book) =>
    apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: book,
    }),
  deleteBook: (id) =>
    apiRequest(`/books/${id}`, {
      method: 'DELETE',
    }),
  uploadCover: (id, formData) =>
    apiRequest(`/books/${id}/cover`, {
      method: 'POST', // or PUT, Laravel supports multipart in POST with _method or PUT
      headers: { 'X-HTTP-Method-Override': 'PUT' },
      body: formData,
    }),
  deleteCover: (id) =>
    apiRequest(`/books/${id}/cover`, {
      method: 'DELETE',
    }),
  getCoverUrl: (id) => `${API_BASE}/books/${id}/cover`,

  // Users (Admin only)
  getUsers: () => apiRequest('/users'),
  createLibrarian: (userData) =>
    apiRequest('/users', {
      method: 'POST',
      body: { ...userData, role: 'librarian' },
    }),

  // Members
  getMembers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/members${q ? `?${q}` : ''}`);
  },
  getMember: (id) => apiRequest(`/members/${id}`),
  createMember: (member) =>
    apiRequest('/members', {
      method: 'POST',
      body: member,
    }),

  // Loans
  getLoans: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/loans${q ? `?${q}` : ''}`);
  },
  getLoan: (id) => apiRequest(`/loans/${id}`),
  createLoan: (loanData) =>
    apiRequest('/loans', {
      method: 'POST',
      body: loanData,
    }),
  returnItem: (loanId, itemId) =>
    apiRequest(`/loans/${loanId}/items/${itemId}/return`, {
      method: 'POST',
    }),
  getOverdue: () => apiRequest('/loans/overdue'),

  // Reports
  getMostBorrowed: (from, to) =>
    apiRequest(`/reports/most-borrowed?from=${from}&to=${to}`),
};
