import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

/**
 * Login Page.
 * Authenticates user credentials, processes success notices from routing redirects,
 * and launches state spinners during submission.
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Email regex validation pattern
  const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  // Read success messages passed via navigation state (e.g. from successful signup)
  useEffect(() => {
    if (location.state && location.state.successMessage) {
      setSuccessMsg(location.state.successMessage);
      // Clear location state history to prevent re-display on reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();

    // Validations
    if (!cleanEmail) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Password is required.");
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      // Redirect straight to protected dashboard workspace
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in animate-duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-900 text-center">Welcome Back</h2>
        <p className="mt-1 text-xs text-slate-400 text-center">
          Authenticate to unlock your workspace files
        </p>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-red-700 font-medium leading-normal">{errorMsg}</span>
        </div>
      )}

      {/* Success alert banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 items-start">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-emerald-700 font-medium leading-normal">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all duration-150 disabled:opacity-60"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50/50 border border-slate-200 focus:border-primary focus:bg-white rounded-xl py-2 pl-9 pr-4 text-xs outline-none transition-all duration-150 disabled:opacity-60"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 rounded-xl shadow-xs hover:shadow-hover transition-all duration-200 flex items-center justify-center gap-1 text-xs mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
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
