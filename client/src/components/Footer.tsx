import React from 'react';
import { ShieldCheck, Github, FileText, Lock, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 mt-20 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white font-mono">
                CERTI<span className="text-brand-400">CHAIN</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographically tamper-evident, institutional Proof-of-Authority blockchain infrastructure for high-assurance credential verification.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PoA Consensus
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                SHA-256
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Ed25519
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/verify" className="hover:text-brand-400 transition-colors">Public Verification</Link></li>
              <li><Link to="/explorer" className="hover:text-brand-400 transition-colors">Blockchain Explorer</Link></li>
              <li><Link to="/merkle-tree" className="hover:text-brand-400 transition-colors">Merkle Tree Proofs</Link></li>
              <li><Link to="/security-lab" className="hover:text-brand-400 transition-colors">Tamper Detection Lab</Link></li>
              <li><Link to="/demo" className="hover:text-brand-400 transition-colors">Interactive Demo</Link></li>
            </ul>
          </div>

          {/* User Dashboards */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Dashboards</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/dashboard/institution" className="hover:text-brand-400 transition-colors">Institution Portal</Link></li>
              <li><Link to="/dashboard/student" className="hover:text-brand-400 transition-colors">Student Holder Wallet</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Admin Sign In</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Account Setup</Link></li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-4 text-xs uppercase tracking-wider">Architecture</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Certificate payload hashes are linked sequentially inside blocks signed by verified validator keys. Original raw documents are never stored directly on the chain.
            </p>
            <div className="flex items-center space-x-2 text-slate-300 font-mono text-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Knowledge Hash Anchoring</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 CertiChain Infrastructure Protocol. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span className="flex items-center space-x-1 hover:text-slate-300 transition-colors">
              <Cpu className="w-3.5 h-3.5" />
              <span>Node Network: Healthy</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
