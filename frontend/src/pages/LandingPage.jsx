import React from 'react';
import { 
  Cpu, 
  Gauge, 
  Activity, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  TrendingDown, 
  Database,
  BarChart2
} from 'lucide-react';

export default function LandingPage({ onGetStarted, backendStatus }) {
  const capabilities = [
    {
      title: "Optimized Sequential LSTM",
      desc: "Deep recurrent network tuned with Optuna that processes 30 consecutive operational cycles using MinMaxScaler to capture micro-degradation trajectories.",
      icon: Cpu,
      tag: "Best Accuracy (MAE 9.92)"
    },
    {
      title: "Multi-Model Comparison Arena",
      desc: "Simultaneously evaluate Random Forest, XGBoost, Baseline LSTM, and Optimized LSTM on the exact same turbofan operational snapshot.",
      icon: Layers,
      tag: "4 Model Architectures"
    },
    {
      title: "Real-Time Sensor Degradation",
      desc: "Stream and inspect 15 critical pressure, temperature, and rotational speed channels (Ps30, T50, phi, Nc, Nf) across 100 benchmark engines.",
      icon: Activity,
      tag: "19 Active Features"
    },
    {
      title: "Explainable AI (GradientExplainer / Deep SHAP)",
      desc: "Attribution heatmaps highlighting why the LSTM estimated specific remaining life values, revealing heavy attribution in the final 5-10 cycles.",
      icon: Sparkles,
      tag: "Transparent Insights"
    }
  ];

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl cyan-gradient-border p-8 md:p-14 bg-gradient-to-b from-navy-900/90 to-navy-950/90 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-electric-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            NASA C-MAPSS FD001 Turbofan Predictive Maintenance Platform
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Industrial Intelligence for <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-electric-400 bg-clip-text text-transparent">
              Remaining Useful Life
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Eliminate unplanned industrial machinery downtime. Leverage calibrated ensemble models and deep LSTM sequence networks to monitor degradation trends and estimate remaining operating cycles before mechanical failure.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => onGetStarted('prediction')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-sm tracking-wide shadow-glow-cyan hover:shadow-cyan-400/50 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Launch Prediction Engine</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => onGetStarted('overview')}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-slate-600 text-sm font-semibold transition-all duration-200"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Explore Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Benchmark Strip */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono uppercase tracking-wider text-slate-400">
            Official NASA FD001 Test Set Performance (100 Turbofan Engines)
          </h2>
          <span className="text-xs text-slate-500 font-mono">Piecewise RUL Cap = 125 Cycles</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border-cyan-500/20 bg-gradient-to-b from-cyan-950/20 to-transparent">
            <div className="text-xs font-mono text-cyan-400">Optimized LSTM MAE</div>
            <div className="text-3xl font-extrabold text-white mt-2">9.92 <span className="text-sm font-normal text-slate-400">cycles</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Lowest error on official test set</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="text-xs font-mono text-slate-400">Optimized LSTM RMSE</div>
            <div className="text-3xl font-extrabold text-white mt-2">13.96 <span className="text-sm font-normal text-slate-400">cycles</span></div>
            <p className="text-[11px] text-slate-400 mt-1">Penalizes large outlier errors</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="text-xs font-mono text-slate-400">Explained Variance (R²)</div>
            <div className="text-3xl font-extrabold text-white mt-2">0.8872</div>
            <p className="text-[11px] text-slate-400 mt-1">88.7% degradation variance captured</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border-slate-800">
            <div className="text-xs font-mono text-slate-400">NASA Asymmetric Score</div>
            <div className="text-3xl font-extrabold text-white mt-2">302.95</div>
            <p className="text-[11px] text-slate-400 mt-1">Heavily penalizes late predictions</p>
          </div>
        </div>
      </div>

      {/* Core Capabilities */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Key Capabilities & Architectural Rigor</h2>
          <p className="text-sm text-slate-400 mt-1">
            Engineered for high reliability without synthetic data fabrication or unsupported health heuristics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div 
                key={idx}
                className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-4 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {cap.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{cap.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">{cap.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Model Catalog Strip */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Trained Model Spectrum in Deployment</span>
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Snapshot Model</span>
            <div className="text-sm font-semibold text-white mt-1">Random Forest</div>
            <p className="text-xs text-slate-400 mt-1">150 estimators, raw features, fast instant tabular inferencing.</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Snapshot Model</span>
            <div className="text-sm font-semibold text-white mt-1">XGBoost Regressor</div>
            <p className="text-xs text-slate-400 mt-1">Gradient boosted decision trees with high sensitivity to Ps30 and T50.</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Sequence Model (30 Cycles)</span>
            <div className="text-sm font-semibold text-white mt-1">Baseline LSTM</div>
            <p className="text-xs text-slate-400 mt-1">64-32 unit stack with StandardScaler capturing multi-cycle wear.</p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/60 border border-cyan-500/30 bg-cyan-950/10">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Recommended Model</span>
            <div className="text-sm font-semibold text-white mt-1">Optimized LSTM</div>
            <p className="text-xs text-slate-300 mt-1">Optuna-optimized network with MinMaxScaler yielding MAE 9.92.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
