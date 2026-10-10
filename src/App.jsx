import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, BookMarked, AlertOctagon, BarChart3, 
  UserPlus, LogOut, ShieldCheck, Library, Menu, X 
} from 'lucide-react';
import { LoginView } from './components/LoginView';
import { BooksView } from './components/BooksView';
import { MembersView } from './components/MembersView';
import { LoansView } from './components/LoansView';
import { OverdueView } from './components/OverdueView';
import { ReportsView } from './components/ReportsView';
import { LibrariansView } from './components/LibrariansView';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [role, setRole] = useState(localStorage.getItem('role') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [currentTab, setCurrentTab] = useState('books');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginSuccess = (data) => {
    setToken(data.access_token);
    setRole(data.role);
    setUsername(localStorage.getItem('username') || 'Usuario');
    setCurrentTab('books');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setToken('');
    setRole('');
    setUsername('');
  };

  if (!token) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = role === 'admin';

  const navItems = [
    { id: 'books', label: 'Catálogo de Libros', icon: BookOpen },
    { id: 'members', label: 'Socios', icon: Users },
    { id: 'loans', label: 'Préstamos y Devoluciones', icon: BookMarked },
    { id: 'overdue', label: 'Libros Vencidos', icon: AlertOctagon },
    ...(isAdmin ? [
      { id: 'reports', label: 'Reporte: Más Prestados', icon: BarChart3 },
      { id: 'librarians', label: 'Alta Bibliotecarios', icon: UserPlus },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Library className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight">Manager Library</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 md:static md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 max-md:-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-none">Manager Library</h1>
            <span className="text-xs text-slate-400 mt-1 block">Ficha ADSO 3413974</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-5 py-4 border-b border-slate-800/60 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-medium">Conectado como:</div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}>
              {role}
            </span>
          </div>
          <div className="font-bold text-sm text-white mt-1 capitalize truncate">
            {username}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {currentTab === 'books' && <BooksView userRole={role} />}
        {currentTab === 'members' && <MembersView />}
        {currentTab === 'loans' && <LoansView />}
        {currentTab === 'overdue' && <OverdueView />}
        {currentTab === 'reports' && isAdmin && <ReportsView />}
        {currentTab === 'librarians' && isAdmin && <LibrariansView />}
      </main>
    </div>
  );
}
