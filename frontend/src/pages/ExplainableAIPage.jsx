import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, BarChart2 } from 'lucide-react';
import { api } from '../api/client';
import PlotlyChart from '../components/PlotlyChart';

export default function ExplainableAIPage() {
  const [shapData, setShapData] = useState(null);
  const [rfXgbData, setRfXgbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sRes, fiRes] = await Promise.all([
          api.getShap(),
          api.getFeatureImportance()
        ]);
        setShapData(sRes);
        setRfXgbData(fiRes);
      } catch (err) {
        console.error("Failed to load explainability data:", err);
        setError("Could not retrieve SHAP and feature attribution data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-slate-400 text-xs font-mono">Loading model attribution & SHAP values...</p>
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

  // 1. SHAP Horizontal Bar Chart
  const shapFeatures = shapData?.features || [];
  // Reverse for horizontal chart (top features at top)
  const sortedShap = [...shapFeatures].reverse();
  const shapY = sortedShap.map(f => `${f.display_name} (${f.feature})`);
  const shapX = sortedShap.map(f => f.mean_absolute_shap);

  const shapPlotData = [
    {
      x: shapX,
      y: shapY,
      type: 'bar',
      orientation: 'h',
      marker: {
        color: shapX.map((_, i) => `rgba(6, 182, 212, ${0.4 + (i / shapX.length) * 0.6})`)
      }
    }
  ];

  const shapLayout = {
    title: { text: 'LSTM Global Feature Attribution (Mean |SHAP Value|)', font: { size: 14, color: '#E2E8F0' } },
    xaxis: { title: 'Mean |SHAP Value| (Impact on Model Output)', gridcolor: '#1E293B', zerolinecolor: '#334155' },
    yaxis: { automargin: true, tickfont: { size: 11, color: '#CBD5E1' } },
    margin: { t: 40, r: 20, b: 50, l: 200 }
  };

  // 2. Tree-Based Importance Chart (Random Forest vs XGBoost)
  const treeFeatures = rfXgbData?.features || [];
  const top10Tree = treeFeatures.slice(0, 10).reverse();
  const treeY = top10Tree.map(f => f.feature);
  const rfX = top10Tree.map(f => f.random_forest);
  const xgbX = top10Tree.map(f => f.xgboost);

  const treePlotData = [
    {
      x: rfX,
      y: treeY,
      name: 'Random Forest Gini Importance',
      type: 'bar',
      orientation: 'h',
      marker: { color: '#06B6D4' }
    },
    {
      x: xgbX,
      y: treeY,
      name: 'XGBoost Gain Importance',
      type: 'bar',
      orientation: 'h',
      marker: { color: '#3B82F6' }
    }
  ];

  const treeLayout = {
    title: { text: 'Top 10 Feature Importance (Random Forest vs XGBoost)', font: { size: 14, color: '#E2E8F0' } },
    barmode: 'group',
    legend: { orientation: 'h', y: -0.2, font: { color: '#94A3B8' } },
    xaxis: { title: 'Relative Importance Score', gridcolor: '#1E293B', zerolinecolor: '#334155' },
    yaxis: { automargin: true },
    margin: { t: 40, r: 20, b: 60, l: 100 }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <span>Explainable AI & Feature Attribution</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Interpret model decision logic using SHapley Additive exPlanations (SHAP) and tree-based split importances.
        </p>
      </div>

      {/* Critical Attribution vs Causation Warning Banner */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
        <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-medium">Important Interpretability Principle:</strong>
          SHAP values and Gini/Gain scores represent <em>mathematical feature attributions</em> within the trained models. They quantify how much a specific feature influenced the model's numerical RUL estimate. They do <strong>not</strong> establish physical causation or thermodynamic root causes in the engine.
        </div>
      </div>

      {/* SHAP Attribution Chart */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">LSTM Model GradientExplainer (Deep SHAP) Global Ranking</h3>
            <p className="text-xs text-slate-400">Ranked across 30-cycle sequential inputs for all 19 active features.</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-navy-900 px-2.5 py-1 rounded border border-slate-800">
            Method: {shapData?.method || "GradientExplainer (Deep SHAP)"}
          </span>
        </div>

        <div className="h-96 w-full">
          <PlotlyChart
            data={shapPlotData}
            layout={shapLayout}
            className="h-full"
          />
        </div>

        {/* Key Findings */}
        <div className="p-4 rounded-xl bg-navy-900/60 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-semibold text-white font-mono text-[11px] uppercase text-cyan-400">Key Analytical Insights</h4>
          <ul className="list-disc list-inside space-y-1 text-slate-300">
            {shapData?.key_insights?.map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tree Feature Importance Chart */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-white">Random Forest vs XGBoost Feature Importance</h3>
          <p className="text-xs text-slate-400">Compares tree split criteria (Gini Impurity reduction vs Gradient Gain).</p>
        </div>

        <div className="h-80 w-full">
          <PlotlyChart
            data={treePlotData}
            layout={treeLayout}
            className="h-full"
          />
        </div>
      </div>

    </div>
  );
}
