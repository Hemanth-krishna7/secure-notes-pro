import React from 'react';
import { FileText, Pin, Folder, Clock, Plus, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Dashboard page.
 * Displays metric cards for Total Notes, Pinned Notes, Categories, and Recent Activity placeholders.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const cards = [
    {
      title: 'Total Notes',
      value: '12',
      change: '+2 this week',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      title: 'Pinned Notes',
      value: '3',
      change: 'Quick access keys',
      icon: Pin,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      title: 'Categories',
      value: '4',
      change: 'Work, Personal, Ideas, Finance',
      icon: Folder,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    }
  ];

  const activities = [
    {
      action: 'Created note',
      target: 'Backend Flask Application Structure',
      time: '12 minutes ago',
    },
    {
      action: 'Pinned note',
      target: 'Production-ready SQLite configurations',
      time: '1 hour ago',
    },
    {
      action: 'Updated note',
      target: 'Tailwind CSS v4 theme variables',
      time: '3 hours ago',
    },
    {
      action: 'Created category',
      target: 'Database Migrations',
      time: 'Yesterday',
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto select-none">
      {/* Top dashboard heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Welcome, {user?.full_name || 'User'}</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics of your secured note vault.</p>
        </div>
        
        {/* Create Note Button Mock */}
        <button
          disabled
          className="inline-flex items-center gap-1.5 bg-primary/40 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-not-allowed shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Note (Auth Locked)</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className="bg-white border border-slate-100/80 p-6 rounded-2xl shadow-premium hover:shadow-hover transition-all duration-200 flex items-start justify-between"
            >
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{card.title}</span>
                <span className="text-3xl font-extrabold text-slate-900 block">{card.value}</span>
                <span className="text-xs text-slate-500 font-medium block">{card.change}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Area: Recent Activity & Action Panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity Card */}
        <div className="bg-white border border-slate-100/80 p-6 rounded-2xl shadow-premium lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {activities.map((act, index) => (
              <div key={index} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-hover"></span>
                  <span className="text-slate-500">{act.action}</span>
                  <span className="font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer flex items-center gap-0.5">
                    {act.target}
                    <ArrowUpRight className="w-3 h-3 opacity-0 hover:opacity-100" />
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-gradient-to-b from-blue-50/50 to-indigo-50/30 border border-blue-50 p-6 rounded-2xl shadow-premium flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">Release Blueprint</span>
            <h4 className="text-sm font-bold text-slate-800 leading-tight">Database migrations are pre-configured</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Flask-Migrate matches the Flask factory. The SQLite engine will connect upon User/Note model creation in subsequent development phases.
            </p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-blue-100/60 flex items-center justify-between text-xs text-slate-400">
            <span>SQLite version: 3.x</span>
            <span>Schema: clean</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
