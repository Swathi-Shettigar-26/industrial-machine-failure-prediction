import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-navy-950 text-slate-400 py-6 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Industrial Intelligence</span>
            <span className="text-slate-600">|</span>
            <span>NASA C-MAPSS FD001 Turbofan Engine Degradation AI</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Flask REST API :5000</span>
            <span>•</span>
            <span>Keras 3 + TensorFlow CPU</span>
            <span>•</span>
            <span>React + Tailwind CSS</span>
          </div>
        </div>

        {/* Mandatory Advisory Notice */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-300 font-medium">Evaluation Notice & Algorithmic Disclaimer:</strong>{' '}
            All engine datasets and measurements displayed are derived from the NASA Commercial Modular Aero-Propulsion System Simulation (C-MAPSS FD001) benchmark. Remaining Useful Life (RUL) estimates and categorized risk alerts (Critical &le; 30 cycles, Warning &le; 75 cycles, Normal &gt; 75 cycles) are algorithmic decision-support indicators and must not be interpreted as certified aviation airworthiness certificates or regulatory maintenance sign-offs.
          </p>
        </div>
      </div>
    </footer>
  );
}
