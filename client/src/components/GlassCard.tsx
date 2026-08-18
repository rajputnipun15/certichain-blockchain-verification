import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', glow = false }) => {
  return (
    <div
      className={`relative rounded-2xl bg-navy-900/80 border border-slate-800/80 backdrop-blur-xl p-6 shadow-xl transition-all duration-300 ${
        glow ? 'shadow-brand-500/10 border-brand-500/30' : 'hover:border-slate-700/80'
      } ${className}`}
    >
      {glow && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-500/20 via-indigo-500/10 to-teal-500/20 rounded-2xl blur-lg -z-10 opacity-75" />
      )}
      {children}
    </div>
  );
};
