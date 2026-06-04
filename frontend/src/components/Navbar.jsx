import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

/**
 * Top Navbar for the public landing pages.
 * Displays brand logo and anchors to mock landing sections, with CTA routing.
 */
const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100/80 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group text-slate-950 font-bold text-lg">
        <Shield className="w-6 h-6 text-primary group-hover:scale-105 transition-transform duration-200" />
        <span>SecureNotes <span className="text-accent">Pro</span></span>
      </Link>

      <div className="hidden sm:flex items-center gap-8">
        <a href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Features</a>
        <a href="#security" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Security</a>
        <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Pricing</a>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          Sign In
        </Link>
        <Link
          to="/register"
          className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:shadow-hover transition-all duration-200 flex items-center gap-1.5"
        >
          <span>Create Account</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
