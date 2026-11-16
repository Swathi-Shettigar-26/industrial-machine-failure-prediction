import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function StatusBadge({ status, urgency, size = 'md' }) {
  const normStatus = (status || '').toUpperCase();

  const configs = {
    NORMAL: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
      icon: CheckCircle2,
      label: 'Nominal Health'
    },
    WARNING: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
      icon: AlertTriangle,
      label: 'Maintenance Warning'
    },
    CRITICAL: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
      icon: AlertOctagon,
      label: 'Critical Alert'
    }
  };

  const current = configs[normStatus] || {
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    dot: 'bg-slate-400',
    icon: HelpCircle,
    label: normStatus || 'Unknown'
  };

  const Icon = current.icon;
  const isSmall = size === 'sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${current.bg} ${isSmall ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot} animate-pulse`} />
      <Icon className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{current.label}</span>
      {urgency && <span className="opacity-70 text-xs font-normal">({urgency} Risk)</span>}
    </span>
  );
}
