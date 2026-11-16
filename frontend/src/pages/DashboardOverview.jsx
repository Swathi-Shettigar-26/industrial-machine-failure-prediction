import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  RefreshCw,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import { api } from '../api/client';
import PlotlyChart from '../components/PlotlyChart';

export default function DashboardOverview({ onNavigateToPrediction }) {
  const [healthData, setHealthData] = useState(null);
  const [modelsData, setModelsData] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [engines, setEngines] = useState([]);
  const [selectedEngineId, setSelectedEngineId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [hRes, mRes, bRes, eRes] = await Promise.all([
        api.checkHealth(),
        api.getModels(),
        api.getBenchmarks(),
        api.getEngines()
      ]);
      setHealthData(hRes);
      setModelsData(mRes.models || []);
      setBenchmarks(bRes);
      setEngines(eRes.engines || []);
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Unable to connect to Flask API at http://127.0.0.1:5000. Please ensure the backend server is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const selectedEngine = engines.find(e => e.engine_id === Number(selectedEngineId)) || engines[0];

  // Prepare Official Test Comparison Bar Chart
  const officialList = benchmarks?.official_test_benchmarks || [];
  const modelNames = officialList.map(m => m.Model);
  const maeValues = officialList.map(m => m.MAE);
  const rmseValues = officialList.map(m => m.RMSE);

  const benchmarkPlotData = [
    {
      x: modelNames,
      y: maeValues,
      name: 'MAE (Mean Absolute Error)',
      type: 'bar',
      marker: { color: '#06B6D4' }
    },
    {
      x: modelNames,
      y: rmseValues,
      name: 'RMSE (Root Mean Square Error)',
      type: 'bar',
      marker: { color: '#3B82F6' }
    }
  ];

  const benchmarkPlotLayout = {
    title: { text: 'Official NASA FD001 Test Set Error (Cycles)', font: { size: 14, color: '#E2E8F0' } },
    barmode: 'group',
    legend: { orientation: 'h', y: -0.2, font: { color: '#94A3B8' } },
    yaxis: { title: 'Cycles', gridcolor: '#1E293B', zerolinecolor: '#334155' },
    xaxis: { gridcolor: '#1E293B' },
    margin: { t: 40, r: 20, b: 60, l: 45 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-sm font-mono">Querying live backend services & models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border-rose-500/30 max-w-2xl mx-auto my-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Backend Offline</h3>
        <p className="text-sm text-slate-300">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold text-sm transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner / System Health Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Backend Node Status */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-400">Flask REST API</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Operational (127.0.0.1:5000)</span>
            </div>
            <p className="text-xs text-slate-400">19 Input Features Verified • CORS Active</p>
          </div>
          <Server className="w-8 h-8 text-cyan-400/80" />
        </div>

        {/* Models In Memory */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-400">Models Pre-Warmed</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>4 Models Active</span>
            </div>
            <p className="text-xs text-slate-400">RF, XGBoost, LSTM, Opt-LSTM</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/80" />
        </div>

        {/* NASA FD001 Dataset */}
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between border-slate-800">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-slate-400">Demonstration Engines</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-electric-400" />
              <span>100 Test Engines</span>
            </div>
            <p className="text-xs text-slate-400">Min 31 cycles • Full sequences ready</p>
          </div>
          <Gauge className="w-8 h-8 text-electric-400/80" />
        </div>

      </div>

      {/* 4 Models Spectrum Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Operational ML Model Catalog</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">Keras 3 + Scikit-Learn 1.6.1 + XGBoost</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modelsData.map((m) => {
            const isBest = m.id === 'optimized_lstm';
            return (
              <div 
                key={m.id}
                className={`glass-panel p-5 rounded-2xl space-y-3 relative overflow-hidden transition-all duration-200 ${
                  isBest ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-transparent' : 'border-slate-800'
                }`}
              >
                {isBest && (
                  <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Recommended
                  </span>
                )}
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">{m.family}</span>
                  <h3 className="text-base font-bold text-white">{m.name}</h3>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Input:</span>
                    <span className="font-mono text-slate-200">
                      {m.sequence_required ? '30 Cycles (3D)' : 'Single Cycle (2D)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Scaler:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[130px]" title={m.preprocessing}>{m.preprocessing}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Test MAE:</span>
                    <span className="font-mono font-bold text-cyan-400">{m.official_metrics?.mae ?? '—'} cycles</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>R² Score:</span>
                    <span className="font-mono text-slate-200">{m.official_metrics?.r2 ?? '—'}</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToPrediction(m.id)}
                  className="w-full mt-2 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-200 transition flex items-center justify-center gap-1.5"
                >
                  <span>Predict With {m.id === 'optimized_lstm' ? 'Opt-LSTM' : m.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benchmark Chart & Quick Engine Launcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plotly Benchmark Comparison Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Comparative Model Accuracy</h3>
            <span className="text-xs text-slate-400 font-mono">100 Test Engines (FD001)</span>
          </div>
          <div className="h-72 w-full">
            <PlotlyChart
              data={benchmarkPlotData}
              layout={benchmarkPlotLayout}
              className="h-full"
            />
          </div>
        </div>

        {/* Quick Engine Profile Selector (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Select Engine Profile</h3>
              <span className="text-xs font-mono text-cyan-400">100 Available</span>
            </div>

            <p className="text-xs text-slate-400">
              Select any of the 100 NASA C-MAPSS test engines to inspect its recorded lifecycle and evaluate RUL.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Engine ID (1 to 100):</label>
              <select
                value={selectedEngineId}
                onChange={(e) => setSelectedEngineId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
              >
                {engines.map(eng => (
                  <option key={eng.engine_id} value={eng.engine_id}>
                    Engine #{eng.engine_id} ({eng.recorded_cycles} recorded cycles)
                  </option>
                ))}
              </select>
            </div>

            {selectedEngine && (
              <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded Cycles at Cutoff:</span>
                  <span className="font-mono text-white font-semibold">{selectedEngine.recorded_cycles} cycles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sequence Status:</span>
                  <span className="font-mono text-emerald-400">30-Cycle Window Ready</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference Ground Truth:</span>
                  <span className="font-mono text-cyan-400">{selectedEngine.final_actual_rul} cycles</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateToPrediction('all', selectedEngineId)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950 font-bold text-sm tracking-wide shadow-glow-cyan transition flex items-center justify-center gap-2"
          >
            <span>Run All Models on Engine #{selectedEngineId}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>

    </div>
  );
}
