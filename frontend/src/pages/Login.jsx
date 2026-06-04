import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

/**
 * Login Page component.
 * Displays user authentication credentials form skeleton with guidance on foundation state.
 */
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Bypasses logic for testing the workspace view
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 text-center">Welcome Back</h2>
        <p className="mt-1 text-xs text-slate-400 text-center">
          Authenticate to unlock your workspace files
        </p>
      </div>

      {/* Demo helper alert banner */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex gap-2">
        <AlertCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-700 leading-normal">
          <strong>Foundation Build Notice:</strong> The back-end session connection is configured but unmapped. Submitting this form redirects to the mock Dashboard interface.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all duration-150"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all duration-150"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded-xl shadow-xs hover:shadow-hover transition-all duration-200 flex items-center justify-center gap-1 text-xs mt-2"
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-50">
        <p className="text-xs text-slate-400">
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-hover hover:underline">
            Create Workspace
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
