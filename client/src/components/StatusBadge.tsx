import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'VALID' | 'INVALID' | 'REVOKED' | 'NOT_FOUND' | 'ACTIVE' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const upper = status.toUpperCase();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs space-x-1',
    md: 'px-3 py-1 text-sm space-x-1.5',
    lg: 'px-4 py-1.5 text-base space-x-2 font-bold',
  }[size];

  if (upper === 'VALID' || upper === 'ACTIVE') {
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold ${sizeClasses}`}>
        <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>{upper === 'ACTIVE' ? 'ACTIVE' : 'AUTHENTIC & VERIFIED'}</span>
      </span>
    );
  }

  if (upper === 'REVOKED') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold ${sizeClasses}`}>
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>CERTIFICATE REVOKED</span>
      </span>
    );
  }

  if (upper === 'INVALID') {
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold ${sizeClasses}`}>
        <XCircle className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>VERIFICATION FAILED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium ${sizeClasses}`}>
      <Clock className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{upper}</span>
    </span>
  );
};
