import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, AlertTriangle, Sliders, Info } from 'lucide-react';
import { api } from '../api/client';
import PlotlyChart from '../components/PlotlyChart';

export default function SensorAnalyticsPage({ initialEngineId = 1 }) {
  const [engines, setEngines] = useState([]);
  const [selectedEngineId, setSelectedEngineId] = useState(initialEngineId);
  const [trajectory, setTrajectory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected sensor for primary inspection
  const [selectedSensor, setSelectedSensor] = useState('sensor_11');

  const sensorDescriptions = {
    sensor_11: { 
      name: 'Static Pressure at HPC Outlet (Ps30)', 
      unit: 'psia', 
      range: '46.85 – 48.53 psia (Baseline healthy ~46.9 – 47.1)', 
      trend: 'Upward drift observed as High Pressure Compressor flow capacity and efficiency degrade.' 
    },
    sensor_4: { 
      name: 'Total Temperature at LPT Outlet (T50)', 
      unit: '°R', 
      range: '1382.3 – 1441.5 °R (Baseline healthy ~1390 – 1405)', 
      trend: 'Thermal rise reflecting declining turbine expansion efficiency and higher exhaust gas temperatures.' 
    },
    sensor_12: { 
      name: 'Ratio of Fuel Flow to Ps30 (phi)', 
      unit: 'pps/psi', 
      range: '518.69 – 523.38 pps/psi (Baseline healthy ~522.0 – 523.0)', 
      trend: 'Downward drift across lifecycle as fuel controller adjusts fuel delivery relative to compressor discharge pressure.' 
    },
    sensor_9: { 
      name: 'Physical Core Speed (Nc)', 
      unit: 'rpm', 
      range: '9021.7 – 9244.6 rpm (Baseline healthy ~9040 – 9065)', 
      trend: 'Upward drift as engine control system demands higher core rotational speed to maintain thrust output.' 
    },
    sensor_7: { 
      name: 'Total Pressure at HPC Outlet (P30)', 
      unit: 'psia', 
      range: '549.85 – 556.06 psia (Baseline healthy ~553.5 – 555.5)', 
      trend: 'Downward drift reflecting compressor aerodynamic delivery losses over operational lifecycle.' 
    },
    sensor_2: { 
      name: 'Total Temperature at LPC Outlet (T24)', 
      unit: '°R', 
      range: '641.21 – 644.53 °R (Baseline healthy ~642.0 – 642.7)', 
      trend: 'Modest thermal rise reflecting progressive low-pressure compression wear.' 
    },
    sensor_3: { 
      name: 'Total Temperature at HPC Outlet (T30)', 
      unit: '°R', 
      range: '1571.0 – 1616.9 °R (Baseline healthy ~1585 – 1595)', 
      trend: 'Thermal increase driven by rising compressor exit temperature.' 
    },
    sensor_8: { 
      name: 'Physical Fan Speed (Nf)', 
      unit: 'rpm', 
      range: '2387.9 – 2388.6 rpm (Baseline healthy ~2388.0)', 
      trend: 'Slight upward drift to sustain required bypass airflow under component wear.' 
    },
    sensor_13: { 
      name: 'Corrected Fan Speed (NRf)', 
      unit: 'rpm', 
      range: '2387.88 – 2388.56 rpm (Baseline healthy ~2388.0)', 
      trend: 'Subtle shift corresponding to physical fan speed adjustment.' 
    },
    sensor_14: { 
      name: 'Corrected Core Speed (NRc)', 
      unit: 'rpm', 
      range: '8099.9 – 8293.7 rpm (Baseline healthy ~8130 – 8145)', 
      trend: 'Upward drift in corrected shaft speed as thermodynamic cycle efficiency decreases.' 
    },
    sensor_15: { 
      name: 'Bypass Ratio (BPR)', 
      unit: 'dimensionless', 
      range: '8.32 – 8.58 (Baseline healthy ~8.40 – 8.44)', 
      trend: 'Upward drift in bypass ratio as core airflow is restricted by compressor degradation.' 
    },
    sensor_17: { 
      name: 'Bleed Enthalpy (htBleed)', 
      unit: 'BTU/lbm', 
      range: '388.0 – 400.0 BTU/lbm (Baseline healthy ~391 – 393)', 
      trend: 'Thermal energy increase in bleed air extracted from the compressor.' 
    },
    sensor_20: { 
      name: 'HPT Coolant Bleed (W31)', 
      unit: 'lbm/s', 
      range: '38.14 – 39.43 lbm/s (Baseline healthy ~38.8 – 39.0)', 
      trend: 'Downward drift reflecting reduced bleed cooling extraction from the high-pressure turbine.' 
    },
    sensor_21: { 
      name: 'LPT Coolant Bleed (W32)', 
      unit: 'lbm/s', 
      range: '22.89 – 23.62 lbm/s (Baseline healthy ~23.3 – 23.4)', 
      trend: 'Downward drift reflecting reduced secondary air cooling in the low-pressure turbine.' 
    },
  };

  useEffect(() => {
    const fetchEngines = async () => {
      try {
        const res = await api.getEngines();
        setEngines(res.engines || []);
      } catch (err) {
        console.error("Failed to load engines:", err);
      }
    };
    fetchEngines();
  }, []);

  useEffect(() => {
    const loadTrajectory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getEngineTrajectory(selectedEngineId);
        setTrajectory(data);
      } catch (err) {
        console.error("Failed to load engine trajectory:", err);
        setError("Could not retrieve engine sensor trajectory.");
      } finally {
        setLoading(false);
      }
    };
    loadTrajectory();
  }, [selectedEngineId]);

  // Build Plotly Time-Series Chart
  const cycles = trajectory?.cycle_numbers || [];
  const sensorValues = trajectory?.sensor_trends?.[selectedSensor] || [];
  const sensorMeta = sensorDescriptions[selectedSensor] || { name: selectedSensor, unit: '', trend: '' };

  const plotData = [
    {
      x: cycles,
      y: sensorValues,
      type: 'scatter',
      mode: 'lines+markers',
      name: `${sensorMeta.name}`,
      line: { color: '#06B6D4', width: 2.5 },
      marker: { size: 4, color: '#38BDF8' }
    }
  ];

  const plotLayout = {
    title: { 
      text: `Engine #${selectedEngineId} – ${sensorMeta.name} Degradation Trajectory`,
      font: { size: 14, color: '#E2E8F0' }
    },
    xaxis: { 
      title: 'Operational Cycle (Time Elapsed)', 
      gridcolor: '#1E293B',
      zerolinecolor: '#334155'
    },
    yaxis: { 
      title: `${sensorMeta.name} [${sensorMeta.unit}]`, 
      gridcolor: '#1E293B',
      zerolinecolor: '#334155'
    },
    margin: { t: 40, r: 20, b: 50, l: 60 }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-cyan-400" />
          <span>Sensor Degradation Analytics</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspect physical degradation signatures over operational cycles across critical gas turbine components.
        </p>
      </div>

      {/* Control Bar: Engine & Sensor Selection */}
      <div className="glass-panel p-5 rounded-2xl border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Engine Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400">Select Turbofan Engine:</label>
          <select
            value={selectedEngineId}
            onChange={(e) => setSelectedEngineId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
          >
            {engines.map(eng => (
              <option key={eng.engine_id} value={eng.engine_id}>
                Engine #{eng.engine_id} ({eng.recorded_cycles} operational cycles)
              </option>
            ))}
          </select>
        </div>

        {/* Sensor Channel Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400">Select Key Degrading Sensor:</label>
          <select
            value={selectedSensor}
            onChange={(e) => setSelectedSensor(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
          >
            {Object.entries(sensorDescriptions).map(([key, desc]) => (
              <option key={key} value={key}>
                {key} – {desc.name} [{desc.unit}]
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Chart Panel */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400">Fetching cycle telemetry...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        ) : (
          <>
            <div className="h-80 w-full">
              <PlotlyChart
                data={plotData}
                layout={plotLayout}
                className="h-full"
              />
            </div>

            {/* Sensor Diagnostic Information Card */}
            <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Info className="w-4 h-4" />
                  <span>NASA C-MAPSS Simulation Context (Degradation Dynamics)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                  Educational Reference
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Channel & Unit:</span>
                  <span className="font-mono text-white">{selectedSensor} [{sensorMeta.unit}]</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Observed FD001 Dataset Range:</span>
                  <span className="font-mono text-white text-[11px]">{sensorMeta.range}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px] font-mono">Simulated Degradation Signature:</span>
                  <span className="text-slate-300">{sensorMeta.trend}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px] text-slate-500">
                <p>
                  *Note: Values reflect simulated C-MAPSS FD001 turbofan degradation dynamics (HPC flow capacity & efficiency losses). Observed ranges show empirical lifecycle boundaries rather than certified airworthiness limits.
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">Channel Coverage:</strong> 14 dynamic degradation sensors are available for trajectory analysis above. Channel <code className="text-cyan-400 font-mono">sensor_6</code> (Total Pressure in bypass-duct, P15) is intentionally excluded from the trajectory trend chart because it remains near-constant (21.60 – 21.61 psia, &sigma; = 0.0014 psia) under FD001 sea-level flight conditions, providing negligible degradation slope despite being actively retained in the model's 19-feature input space.
                </p>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
