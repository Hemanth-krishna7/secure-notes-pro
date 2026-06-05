import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Home, LogOut, Archive } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Collapsible Navigation Sidebar.
 * Switches between fully open, minimized icon-only (desktop), and sliding drawer (mobile).
 */
const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All Notes', path: '/dashboard/notes', icon: FileText },
    { name: 'Archived Notes', path: '/dashboard/archive', icon: Archive }
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-15 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ease-out h-screen z-20
          ${isOpen ? 'w-64' : 'w-0 md:w-20'} 
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          fixed md:relative
        `}
      >
        {/* Brand/Logo header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-50">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 group">
            <Shield className="w-6 h-6 text-primary group-hover:scale-105 transition-transform duration-200" />
            {isOpen && (
              <span className="text-base font-bold tracking-tight animate-fade-in">
                SecureNotes <span className="text-accent text-sm font-semibold">Pro</span>
              </span>
            )}
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-grow px-3 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-blue-50 text-primary shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer action */}
        <div className="p-3 border-t border-slate-50 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Return to Site</span>}
          </Link>
          
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50/70 transition-all duration-150 text-left focus:outline-none cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
