import React from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyChart({ data, layout, config, style, className }) {
  const defaultLayout = {
    autosize: true,
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: {
      color: '#94A3B8',
      family: 'Inter, system-ui, sans-serif'
    },
    margin: { t: 30, r: 20, b: 40, l: 50 },
    ...layout
  };

  const defaultConfig = {
    responsive: true,
    displayModeBar: false,
    ...config
  };

  return (
    <div className={`w-full overflow-hidden ${className || ''}`} style={style}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
