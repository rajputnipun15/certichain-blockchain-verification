import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Cpu, GitCommit, FlaskConical, Play, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-navy-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-brand-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                CERTI<span className="text-brand-400">CHAIN</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest -mt-1 font-semibold">
                Proof of Authority Ledger
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/verify"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/verify') ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify</span>
            </Link>

            <Link
              to="/explorer"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/explorer') ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Explorer</span>
            </Link>

            <Link
              to="/merkle-tree"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/merkle-tree') ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GitCommit className="w-4 h-4" />
              <span>Merkle Tree</span>
            </Link>

            <Link
              to="/security-lab"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/security-lab') ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300">Tamper Lab</span>
            </Link>

            <Link
              to="/demo"
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 hover:border-emerald-400/60`}
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>3-Min Demo</span>
            </Link>
          </div>

          {/* User Auth Controls */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={user.role === 'INSTITUTION_ADMIN' ? '/dashboard/institution' : '/dashboard/student'}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all flex items-center space-x-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center space-x-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/verify"
                  className="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-500/25 transition-all"
                >
                  Verify Certificate
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
