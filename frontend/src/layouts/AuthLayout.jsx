import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * Reusable AuthLayout shell.
 * Provides a modern, Light-Mode-styled container with glassmorphic cards and central alignment.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 animate-fade-in">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 group text-primary font-bold text-2xl mb-2">
          <Shield className="w-8 h-8 text-primary group-hover:rotate-6 transition-transform duration-200" />
          <span>SecureNotes <span className="text-accent">Pro</span></span>
        </Link>
        <p className="text-center text-sm text-slate-500 font-medium">
          Zero-compromise security for your knowledge.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/90 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl shadow-premium border border-slate-100/80 hover:shadow-hover transition-shadow duration-300">
          <Outlet />
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} SecureNotes Pro. All rights reserved.
      </div>
    </div>
  );
};

export default AuthLayout;
