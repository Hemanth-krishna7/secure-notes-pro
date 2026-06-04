import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, Sparkles, Folder, Eye, Lock, Zap, CheckCircle } from 'lucide-react';

/**
 * Home landing page.
 * Renders a sleek, responsive SaaS marketing page with features, CTAs, and security highlights.
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none animate-fade-in">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Element */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-primary mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Introducing SecureNotes Pro v1.0</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl leading-tight">
          Keep your thoughts organized and <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">perfectly secured</span>
        </h1>

        <p className="mt-6 text-lg text-slate-500 max-w-2xl leading-relaxed">
          The privacy-first markdown workspace built for professionals. Capture ideas, manage categorizations, and protect sensitive data with SQLite local safety.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-semibold px-8 py-3.5 rounded-2xl shadow-premium hover:shadow-hover transition-all duration-200 text-sm"
          >
            Start writing for free
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3.5 rounded-2xl transition-colors duration-150 text-sm"
          >
            View Demo Workspace
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Built for speed, styled for comfort</h2>
            <p className="text-slate-500 mt-4 text-base">
              A minimalist environment engineered with modern tools to maximize your daily knowledge retention and indexing.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:scale-102 transition-transform duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Secure Storage</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Your credentials and files are stored safely in an isolated SQLite container with strict HTTP-only secure cookie session tokens.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:scale-102 transition-transform duration-200">
              <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center mb-4">
                <Folder className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Robust Taxonomy</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Filter and group thoughts in dynamic folders, custom tagged categories, and color-coded lists to quickly isolate what matters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:scale-102 transition-transform duration-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sleek Performance</h3>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Instant database queries, lightweight client footprints, and Vite React components yield a blazing fast sub-second responsive UI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Highlight */}
      <section id="security" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-100 rounded-full text-xs font-semibold text-primary mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Session Isolation</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              Preparing for session-based cookie authorization
            </h2>
            <p className="text-slate-500 mt-4 text-sm leading-relaxed">
              We reject high-risk browser token caching. Our architecture targets Flask-Login cookie checks, avoiding client-side JWT extraction exploits.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Cookies protected with HttpOnly & SameSite flags</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Immediate database connection lifecycle closures</span>
              </li>
            </ul>
          </div>
          <div className="flex-shrink-0 bg-white p-6 rounded-2xl shadow-premium border border-slate-100 max-w-sm">
            <span className="text-xs font-bold text-slate-400 block mb-2 tracking-wider uppercase">Connection State</span>
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-800">Secure TLS active</span>
            </div>
            <div className="mt-4 border-t border-slate-50 pt-4 text-xs text-slate-500 leading-relaxed">
              Flask CORS configured explicitly to trust local port bounds. Credentials validation initialized.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-center px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span className="text-white font-bold text-sm">SecureNotes Pro</span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} SecureNotes Pro. Prepared for next-stage database migrations.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
