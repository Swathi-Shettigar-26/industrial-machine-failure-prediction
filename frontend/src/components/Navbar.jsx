import React from 'react';
import { 
  Activity, 
  BarChart3, 
  Gauge, 
  Sparkles, 
  Layers, 
  Cpu, 
  Radio, 
  Server,
  Home
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus, onRefreshStatus }) {
  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'prediction', label: 'RUL Prediction', icon: Gauge },
    { id: 'sensors', label: 'Sensor Analytics', icon: Activity },
    { id: 'comparison', label: 'Model Benchmark', icon: Layers },
    { id: 'xai', label: 'Explainable AI', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-electric-600 flex items-center justify-center shadow-glow-cyan/50 shadow-md group-hover:scale-105 transition-transform duration-200">
              <Cpu className="w-5 h-5 text-navy-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Industrial Intelligence
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono tracking-tight hidden sm:block">
                Predictive Maintenance & RUL Estimation
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backend Status Indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshStatus}
              title="Click to re-check Flask backend status"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                backendStatus === 'online'
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                  : backendStatus === 'checking'
                  ? 'bg-amber-950/40 text-amber-400 border-amber-500/30 animate-pulse'
                  : 'bg-rose-950/40 text-rose-400 border-rose-500/30 hover:bg-rose-900/40'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'online'
                  ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]'
                  : backendStatus === 'checking'
                  ? 'bg-amber-400'
                  : 'bg-rose-500'
              }`} />
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {backendStatus === 'online' ? 'API Online :5000' : backendStatus === 'checking' ? 'Connecting...' : 'API Disconnected'}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Row */}
      <div className="md:hidden flex overflow-x-auto py-2 px-4 gap-2 border-t border-slate-800 bg-navy-900/90 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
