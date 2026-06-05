import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu, User, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Reusable DashboardLayout.
 * Manages side-drawer toggling states and outlines the top navigation bar.
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex overflow-hidden">
      {/* Collapsible Sidebar component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col overflow-y-auto h-screen relative">
        {/* Workspace Top Header */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors duration-150 focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold text-slate-900 leading-none">Dashboard</h1>
              <span className="text-xs text-slate-400 mt-1">Workspace Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mock Notification Trigger */}
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 relative transition-colors duration-150 focus:outline-none">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Information */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-primary flex items-center justify-center font-bold text-sm">
                {getInitials(user?.full_name)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 leading-none">{user?.full_name || 'User'}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Premium Plan</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Dashboard Main Workspace Area */}
        <main className="flex-1 p-6 md:p-8 animate-slide-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
