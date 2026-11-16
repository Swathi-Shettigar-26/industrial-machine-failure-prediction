import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Cpu, 
  Layers, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileText,
  Sliders,
  Check
} from 'lucide-react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import PlotlyChart from '../components/PlotlyChart';

export default function PredictionPage({ initialModel = 'optimized_lstm', initialEngineId = 1 }) {
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [inputMode, setInputMode] = useState('engine'); // 'engine' | 'manual'
  const [engines, setEngines] = useState([]);
  const [selectedEngineId, setSelectedEngineId] = useState(initialEngineId);
  const [currentEngineTrajectory, setCurrentEngineTrajectory] = useState(null);

  // Exact NASA C-MAPSS FD001 feature definitions & units for labels and tooltips
  const featureDefinitions = {
    cycle: { label: 'Operational Cycle (Elapsed Time)', symbol: 'cycle', unit: 'cycles' },
    op_setting_1: { label: 'Operating Setting 1 (Altitude)', symbol: 'Alt', unit: 'norm' },
    op_setting_2: { label: 'Operating Setting 2 (Mach Number)', symbol: 'Mach', unit: 'norm' },
    op_setting_3: { label: 'Operating Setting 3 (Throttle Resolver Angle)', symbol: 'TRA', unit: 'norm' },
    sensor_2: { label: 'Total Temperature at LPC Outlet (T24)', symbol: 'T24', unit: '°R' },
    sensor_3: { label: 'Total Temperature at HPC Outlet (T30)', symbol: 'T30', unit: '°R' },
    sensor_4: { label: 'Total Temperature at LPT Outlet (T50)', symbol: 'T50', unit: '°R' },
    sensor_6: { label: 'Total Pressure in bypass-duct (P15)', symbol: 'P15', unit: 'psia' },
    sensor_7: { label: 'Total Pressure at HPC Outlet (P30)', symbol: 'P30', unit: 'psia' },
    sensor_8: { label: 'Physical Fan Speed (Nf)', symbol: 'Nf', unit: 'rpm' },
    sensor_9: { label: 'Physical Core Speed (Nc)', symbol: 'Nc', unit: 'rpm' },
    sensor_11: { label: 'Static Pressure at HPC Outlet (Ps30)', symbol: 'Ps30', unit: 'psia' },
    sensor_12: { label: 'Ratio of Fuel Flow to Ps30 (phi)', symbol: 'phi', unit: 'pps/psi' },
    sensor_13: { label: 'Corrected Fan Speed (NRf)', symbol: 'NRf', unit: 'rpm' },
    sensor_14: { label: 'Corrected Core Speed (NRc)', symbol: 'NRc', unit: 'rpm' },
    sensor_15: { label: 'Bypass Ratio (BPR)', symbol: 'BPR', unit: 'ratio' },
    sensor_17: { label: 'Bleed Enthalpy (htBleed)', symbol: 'htBleed', unit: 'BTU/lbm' },
    sensor_20: { label: 'HPT Coolant Bleed (W31)', symbol: 'W31', unit: 'lbm/s' },
    sensor_21: { label: 'LPT Coolant Bleed (W32)', symbol: 'W32', unit: 'lbm/s' },
  };

  // Manual Input State (19 features)
  const [manualRecord, setManualRecord] = useState({
    cycle: 100,
    op_setting_1: -0.0007,
    op_setting_2: -0.0004,
    op_setting_3: 100.0,
    sensor_2: 642.50,
    sensor_3: 1588.00,
    sensor_4: 1405.00,
    sensor_6: 21.61,
    sensor_7: 553.80,
    sensor_8: 2388.08,
    sensor_9: 9055.00,
    sensor_11: 47.45,
    sensor_12: 521.80,
    sensor_13: 2388.07,
    sensor_14: 8135.00,
    sensor_15: 8.43,
    sensor_17: 393.00,
    sensor_20: 38.85,
    sensor_21: 23.35
  });

  // Prediction State
  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [engineLoading, setEngineLoading] = useState(false);

  // Load engines catalog on mount
  useEffect(() => {
    const loadEngines = async () => {
      try {
        const data = await api.getEngines();
        setEngines(data.engines || []);
      } catch (err) {
        console.error("Failed to fetch engines list:", err);
      }
    };
    loadEngines();
  }, []);

  // Fetch trajectory when engine changes
  useEffect(() => {
    if (inputMode === 'engine' && selectedEngineId) {
      const fetchTrajectory = async () => {
        setEngineLoading(true);
        try {
          const traj = await api.getEngineTrajectory(selectedEngineId);
          setCurrentEngineTrajectory(traj);
        } catch (err) {
          console.error("Failed to load trajectory for engine:", err);
        } finally {
          setEngineLoading(false);
        }
      };
      fetchTrajectory();
    }
  }, [selectedEngineId, inputMode]);

  // Automatically compute prediction on initial engine load for seamless UX
  useEffect(() => {
    if (currentEngineTrajectory?.has_full_lstm_sequence && !predictionResult && !loading) {
      handlePredict();
    }
  }, [currentEngineTrajectory]);

  const handlePredict = async () => {
    setLoading(true);
    setApiError(null);
    setPredictionResult(null);

    try {
      let payload = { model: selectedModel };

      if (inputMode === 'engine') {
        payload.engine_id = Number(selectedEngineId);
      } else {
        // Manual input
        const isSequential = ['lstm', 'optimized_lstm', 'all'].includes(selectedModel);
        if (isSequential) {
          // If user picked an LSTM model in manual mode, they need 30 cycles
          if (currentEngineTrajectory?.last_30_cycles) {
            // Use current loaded trajectory sequence modified by manual record
            const seq = [...currentEngineTrajectory.last_30_cycles];
            seq[seq.length - 1] = { ...manualRecord };
            payload.sequence = seq;
          } else {
            throw new Error("Sequential LSTM models require 30 consecutive cycles. Please use 'Select Engine Profile' mode or provide a 30-cycle sequence.");
          }
        } else {
          // Single record for RF or XGBoost
          payload.record = manualRecord;
        }
      }

      const res = await api.predict(payload);
      setPredictionResult(res);
    } catch (err) {
      console.error("Prediction API error:", err);
      const msg = err.response?.data?.message || err.message || "Failed to execute prediction.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const modelsList = [
    { id: 'optimized_lstm', name: 'Optimized LSTM', tag: 'Best (MAE 9.92)', seq: true },
    { id: 'lstm', name: 'Baseline LSTM', tag: 'MAE 10.60', seq: true },
    { id: 'random_forest', name: 'Random Forest', tag: 'MAE 13.38', seq: false },
    { id: 'xgboost', name: 'XGBoost', tag: 'MAE 13.25', seq: false },
    { id: 'all', name: 'All 4 Models (Comparison Arena)', tag: 'Multi-Model', seq: true },
  ];

  // Plotly Gauge Setup for RUL Result
  const currentRul = predictionResult?.predicted_rul ?? 0;
  const gaugeData = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: currentRul,
      number: { suffix: " cycles", font: { color: "#FFFFFF", size: 36, family: 'Inter' } },
      title: { text: "Estimated Remaining Useful Life", font: { color: "#94A3B8", size: 14 } },
      gauge: {
        axis: { range: [0, 130], tickwidth: 1, tickcolor: "#475569" },
        bar: { color: currentRul <= 30 ? "#EF4444" : currentRul <= 75 ? "#F59E0B" : "#10B981", width: 14 },
        bgcolor: "#0B0F19",
        borderwidth: 1,
        bordercolor: "#334155",
        steps: [
          { range: [0, 30], color: "rgba(239, 68, 68, 0.25)" },     // Critical
          { range: [30, 75], color: "rgba(245, 158, 11, 0.25)" },   // Warning
          { range: [75, 130], color: "rgba(16, 185, 129, 0.25)" }   // Normal
        ],
        threshold: {
          line: { color: "#06B6D4", width: 3 },
          thickness: 0.8,
          value: currentRul
        }
      }
    }
  ];

  const gaugeLayout = {
    height: 250,
    margin: { t: 40, r: 30, b: 20, l: 30 },
    paper_bgcolor: 'transparent'
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Gauge className="w-6 h-6 text-cyan-400" />
          <span>Remaining Useful Life Prediction Engine</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Perform live condition inference using trained models. Evaluates operational sensor measurements against NASA C-MAPSS degradation baselines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Model Selection */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
            <label className="text-xs font-mono uppercase text-slate-400">1. Select Machine Learning Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {modelsList.map(m => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      m.id === 'all' ? 'sm:col-span-2' : ''
                    } ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-[0_0_15px_-3px_rgba(6,182,212,0.25)]'
                        : 'border-slate-800 bg-navy-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{m.tag}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Mode Selector */}
          <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase text-slate-400">2. Input Data Source</label>
              <div className="flex rounded-lg bg-navy-900 p-0.5 border border-slate-800">
                <button
                  onClick={() => setInputMode('engine')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    inputMode === 'engine' ? 'bg-cyan-500 text-navy-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Test Engine Profile (100)
                </button>
                <button
                  onClick={() => setInputMode('manual')}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                    inputMode === 'manual' ? 'bg-cyan-500 text-navy-950 font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Sensor Inputs
                </button>
              </div>
            </div>

            {/* Mode A: Engine Profile */}
            {inputMode === 'engine' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Select Engine ID:</label>
                  <select
                    value={selectedEngineId}
                    onChange={(e) => setSelectedEngineId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  >
                    {engines.map(eng => (
                      <option key={eng.engine_id} value={eng.engine_id}>
                        Engine #{eng.engine_id} (Lifecycle: {eng.recorded_cycles} cycles recorded)
                      </option>
                    ))}
                  </select>
                </div>

                {currentEngineTrajectory && (
                  <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Engine Cutoff Cycle:</span>
                      <span className="font-mono text-white font-bold">{currentEngineTrajectory.recorded_cycles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">30-Cycle Window Availability:</span>
                      <span className="font-mono text-emerald-400">
                        {currentEngineTrajectory.has_full_lstm_sequence ? "Full 30 Cycles Available (Ready)" : "Insufficient Sequence"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dataset Ground Truth (For Comparison):</span>
                      <span className="font-mono text-cyan-400 font-semibold">
                        {currentEngineTrajectory.final_actual_rul} cycles
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                      *Ground-truth reference is from NASA RUL_FD001.txt and is presented solely for evaluation benchmark comparisons.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Manual Sensor Inputs */}
            {inputMode === 'manual' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Manual inputs update the current snapshot. For sequential LSTM models, the prior 29 cycles from Engine #{selectedEngineId} are combined with this custom cycle.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2">
                  {Object.entries(manualRecord).map(([key, val]) => {
                    const meta = featureDefinitions[key] || { label: key, symbol: '', unit: '' };
                    return (
                      <div key={key} className="space-y-1">
                        <label 
                          className="text-[11px] font-mono text-slate-300 block truncate cursor-help" 
                          title={`${key}: ${meta.label} [${meta.unit}]`}
                        >
                          <span className="text-cyan-400 font-semibold">{key}</span>
                          {meta.symbol && <span className="text-slate-400 text-[10px] ml-1">({meta.symbol})</span>}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={val}
                          title={`${meta.label} [${meta.unit}]`}
                          onChange={(e) => setManualRecord({ ...manualRecord, [key]: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-[10px] font-mono text-slate-500 block truncate" title={meta.label}>
                          {meta.unit}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Run Prediction Button */}
            <button
              onClick={handlePredict}
              disabled={loading || engineLoading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-glow-cyan transition flex items-center justify-center gap-2.5 ${
                loading || engineLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-navy-950'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Remaining Useful Life...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current stroke-[2]" />
                  <span>Run Prediction Inference</span>
                </>
              )}
            </button>

            {apiError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Prediction Error</span>
                </div>
                <p className="leading-relaxed">{apiError}</p>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Prediction Results & Advisory (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {predictionResult ? (
            <div className="glass-panel p-6 rounded-2xl border-cyan-500/30 space-y-6 relative overflow-hidden bg-gradient-to-b from-navy-900/90 to-navy-950/90 shadow-xl">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-400">Inference Complete</span>
                  <h3 className="text-lg font-bold text-white">
                    {predictionResult.model_name || "Comparison Results"}
                  </h3>
                </div>
                {predictionResult.advisory && (
                  <StatusBadge 
                    status={predictionResult.advisory.status} 
                    urgency={predictionResult.advisory.urgency} 
                  />
                )}
              </div>

              {/* Data Source Distinction Badge */}
              <div>
                {predictionResult.is_manual_input || inputMode === 'manual' ? (
                  <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-xs">
                    <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
                    <div>
                      <span className="font-semibold font-mono block">Manual What-If Simulation</span>
                      <span className="text-[10px] text-amber-300/80">User-supplied snapshot • Hypothetical scenario (Not NASA engine telemetry)</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 p-2.5 rounded-xl text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                    <div>
                      <span className="font-semibold font-mono block">NASA C-MAPSS Telemetry</span>
                      <span className="text-[10px] text-cyan-300/80">
                        Official Test Engine #{selectedEngineId} • Cutoff Cycle {currentEngineTrajectory?.recorded_cycles || '-'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Plotly Dial Gauge */}
              <div className="w-full flex justify-center -my-2">
                <PlotlyChart
                  data={gaugeData}
                  layout={gaugeLayout}
                  className="w-full"
                />
              </div>

              {/* Advisory Details Box */}
              {predictionResult.advisory && (
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">Recommended Action:</span>
                    <span className="font-mono text-cyan-400">{predictionResult.advisory.urgency} Urgency</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {predictionResult.advisory.recommended_action}
                  </p>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px] font-mono">
                    <span>Execution Latency:</span>
                    <span className="text-slate-200">{predictionResult.execution_time_ms} ms</span>
                  </div>
                </div>
              )}

              {/* Multi-Model Comparison Arena Details (If 'all' was selected) */}
              {predictionResult.models_comparison && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-mono uppercase text-slate-400">4-Model Side-by-Side Arena</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(predictionResult.models_comparison).map(([mKey, mVal]) => (
                      <div key={mKey} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 space-y-1">
                        <div className="text-[11px] text-slate-400">{mVal.name}</div>
                        <div className="text-base font-bold text-white font-mono">{mVal.predicted_rul} <span className="text-[10px] font-normal text-slate-400">cycles</span></div>
                        <div className="text-[10px] font-mono text-cyan-400">MAE {mVal.benchmark_mae}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Reference Comparison */}
              {predictionResult.engine_reference && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Ground-Truth Reference:</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    {predictionResult.engine_reference.actual_rul_ground_truth} cycles 
                    {predictionResult.engine_reference.rul_error !== null && (
                      <span className="text-slate-400 font-normal ml-1">
                        (Δ {predictionResult.engine_reference.rul_error})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Advisory Disclaimer */}
              <div className="text-[10px] text-slate-400 leading-relaxed flex items-start gap-1.5 pt-1 border-t border-slate-800">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Algorithmic advisory estimate. Not a certified airworthiness sign-off.
                </span>
              </div>

            </div>
          ) : (
            /* Empty Placeholder State */
            <div className="glass-panel p-8 rounded-2xl border-slate-800 text-center space-y-4 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-navy-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Gauge className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No Prediction Computed Yet</h3>
                <p className="text-xs text-slate-400 max-w-xs">
                  Select a model, choose an engine or customize sensor measurements, and click "Run Prediction Inference" to generate RUL estimates.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
