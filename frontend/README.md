# Industrial Intelligence Frontend (React + Vite + Tailwind CSS + Plotly)

A high-performance, dark-themed industrial condition monitoring dashboard for Turbofan Remaining Useful Life (RUL) estimation.

---

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3 (Custom dark-navy palette, glass panels, cyan and electric blue accents)
- **Charts**: Plotly (`plotly.js-dist-min` + `react-plotly.js`)
- **Icons**: Lucide React
- **API Client**: Axios

---

## Application Pages & Capabilities

1. **Home / Landing Page**: Industrial Intelligence branding, key capabilities, model spectrum, official test benchmark summary.
2. **Overview Dashboard**: Real-time Flask API connectivity monitor, 4-model catalog cards, interactive engine picker, official test error bar chart.
3. **RUL Prediction**: Model selector (Optimized LSTM, Baseline LSTM, Random Forest, XGBoost, and 4-Model Comparison Arena), 100 test engine trajectory selector, manual 19-sensor input simulator, live prediction execution.
4. **Prediction Results**: Radial speedometer gauge, categorized advisory states (Critical $\le 30$ cycles, Warning $\le 75$ cycles, Normal $> 75$ cycles), action recommendation, latency counter, ground-truth comparison, mandatory airworthiness disclaimer.
5. **Sensor Analytics**: Time-series degradation curves for key channels (Ps30, T50, phi, Nc, P30), physical failure mechanisms, nominal operating baselines.
6. **Model Benchmark**: Side-by-side performance comparison (MAE, RMSE, $R^2$, NASA score), clearly differentiating official FD001 test results from internal validation splits.
7. **Explainable AI**: KernelSHAP global feature rankings, temporal attribution insights, Gini vs Gradient Gain tree feature importance, attribution vs causation principle banner.

---

## Development Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run Vite Dev Server
```bash
npm run dev
```
The application will launch on `http://127.0.0.1:5173/`.

### 3. Production Build
```bash
npm run build
```
Generates production-optimized static assets in `frontend/dist/`.
