import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, AlertTriangle, Award, CheckCircle, BarChart3 } from 'lucide-react';
import { api } from '../api/client';
import PlotlyChart from '../components/PlotlyChart';

export default function ModelComparisonPage() {
  const [benchmarks, setBenchmarks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      setLoading(true);
      try {
        const data = await api.getBenchmarks();
        setBenchmarks(data);
      } catch (err) {
        console.error("Failed to fetch model benchmarks:", err);
        setError("Could not retrieve model comparison benchmarks.");
      } finally {
        setLoading(false);
      }
    };
    fetchBenchmarks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-xs font-mono">Loading official benchmarks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center text-sm">
        {error}
      </div>
    );
  }

  const officialList = benchmarks?.official_test_benchmarks || [];
  const validationList = benchmarks?.validation_benchmarks || [];

  // Plot: Official Test Set Radar or Grouped Bar Chart
  const mNames = officialList.map(m => m.Model);
  const maes = officialList.map(m => m.MAE);
  const rmses = officialList.map(m => m.RMSE);
  const r2s = officialList.map(m => (m.R2 * 100).toFixed(1)); // percentage

  const barData = [
    {
      x: mNames,
      y: maes,
      name: 'MAE (Cycles - Lower is Better)',
      type: 'bar',
      marker: { color: '#06B6D4' }
    },
    {
      x: mNames,
      y: rmses,
      name: 'RMSE (Cycles - Lower is Better)',
      type: 'bar',
      marker: { color: '#3B82F6' }
    }
  ];

  const barLayout = {
    title: { text: 'Official NASA C-MAPSS FD001 Test Set Error (100 Engines)', font: { size: 14, color: '#E2E8F0' } },
    barmode: 'group',
    legend: { orientation: 'h', y: -0.2, font: { color: '#94A3B8' } },
    yaxis: { title: 'Error in Cycles', gridcolor: '#1E293B', zerolinecolor: '#334155' },
    margin: { t: 40, r: 20, b: 60, l: 45 }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-cyan-400" />
          <span>Multi-Model Benchmark & Comparative Evaluation</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detailed side-by-side performance comparison across all four evaluated machine learning architectures.
        </p>
      </div>

      {/* Top Winner Card: Optimized LSTM */}
      <div className="glass-panel p-6 rounded-2xl border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-navy-900 to-navy-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow-cyan/20">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/40">
            <Award className="w-3.5 h-3.5" />
            <span>Benchmark Winner • NASA FD001 Test Set</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Optimized LSTM (Optuna-Tuned)</h2>
          <p className="text-sm text-slate-300 max-w-xl">
            Outperforms all competing models by capturing multi-cycle continuous wear dynamics. Achieves the lowest Mean Absolute Error (<strong>9.92 cycles</strong>) and lowest asymmetric NASA penalty score (<strong>302.95</strong>).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 shrink-0 font-mono text-center">
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-700">
            <div className="text-xs text-slate-400">Official Test MAE</div>
            <div className="text-xl font-bold text-cyan-400">9.9228</div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/80 border border-slate-700">
            <div className="text-xs text-slate-400">R² Score</div>
            <div className="text-xl font-bold text-white">0.8872</div>
          </div>
        </div>
      </div>

      {/* Chart: Official Test Set Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h3 className="text-base font-semibold text-white">Official Test Set Error Comparison</h3>
        <div className="h-72 w-full">
          <PlotlyChart
            data={barData}
            layout={barLayout}
            className="h-full"
          />
        </div>
      </div>

      {/* Table 1: Official Test Set Benchmarks */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">1. Official NASA Test Set Performance (FD001)</h3>
            <p className="text-xs text-slate-400">Evaluated on the 100 test engines with ground truth from RUL_FD001.txt at test cutoff.</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-navy-900 px-2.5 py-1 rounded-md border border-slate-800">
            100 Test Trajectories
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-navy-900/80 font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">MAE (Cycles)</th>
                <th className="py-3 px-4">RMSE (Cycles)</th>
                <th className="py-3 px-4">Explained Variance (R²)</th>
                <th className="py-3 px-4">NASA Penalty Score</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {officialList.map((row, idx) => {
                const isBest = row.Model.includes("Optimized");
                return (
                  <tr key={idx} className={isBest ? 'bg-cyan-950/20 text-white font-semibold' : 'text-slate-300'}>
                    <td className="py-3 px-4 flex items-center gap-2 font-sans">
                      {isBest && <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      <span>{row.Model}</span>
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-bold">{Number(row.MAE).toFixed(4)}</td>
                    <td className="py-3 px-4">{Number(row.RMSE).toFixed(4)}</td>
                    <td className="py-3 px-4">{Number(row.R2).toFixed(4)}</td>
                    <td className="py-3 px-4">{row.NASA_Score != null && !isNaN(row.NASA_Score) ? Number(row.NASA_Score).toFixed(2) : '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${
                        isBest ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isBest ? 'Top Performer' : 'Baseline'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Fair Validation Set Benchmarks */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">2. Internal Validation Set Benchmarks</h3>
            <p className="text-xs text-slate-400">Split by engine ID (20 validation engines, 4,070 records / 3,490 sliding windows).</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-navy-900 px-2.5 py-1 rounded-md border border-slate-800">
            20 Validation Engines
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-navy-900/80 font-mono text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Model</th>
                <th className="py-3 px-4">MAE (Cycles)</th>
                <th className="py-3 px-4">RMSE (Cycles)</th>
                <th className="py-3 px-4">R²</th>
                <th className="py-3 px-4">NASA Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {validationList.map((row, idx) => (
                <tr key={idx} className="text-slate-300">
                  <td className="py-3 px-4 font-sans font-medium text-white">{row.Model}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{Number(row.MAE).toFixed(4)}</td>
                  <td className="py-3 px-4">{Number(row.RMSE).toFixed(4)}</td>
                  <td className="py-3 px-4">{Number(row.R2).toFixed(4)}</td>
                  <td className="py-3 px-4">{row.NASA_Score != null && !isNaN(row.NASA_Score) ? Number(row.NASA_Score).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
