# Industrial Intelligence – Predictive Maintenance Backend REST API

This backend provides a professional Flask REST API for turbofan engine Remaining Useful Life (RUL) estimation using machine learning and deep learning models trained on NASA C-MAPSS FD001.

---

## Architecture Overview

```text
backend/
├── app.py                      # Flask application factory, CORS, and error handlers
├── config.py                   # Paths, hyperparameters, sequence limits, and risk thresholds
├── requirements.txt            # Pinned, tested dependencies for Python 3.11
├── routes/
│   ├── health.py               # GET /api/health, GET /api/models
│   ├── prediction.py           # POST /api/predict
│   ├── engines.py              # GET /api/engines, GET /api/engines/<id>/trajectory
│   ├── analytics.py            # GET /api/analytics/benchmarks, GET /api/analytics/feature-importance
│   └── explainability.py       # GET /api/explainability/shap
└── services/
    ├── model_loader.py         # Thread-safe singleton registry for RF, XGB, LSTM, Opt-LSTM
    ├── preprocessing.py        # 19-feature validation, scaling, sequence formatting
    ├── prediction_service.py   # Prediction routing, comparison arena, advisory logic
    └── dataset_service.py      # NASA C-MAPSS test engines and trajectory streamer
```

---

## Machine Learning Models & Input Specifications

| Model | Artifact | Input Shape | Scaler | Preprocessing Rule |
| :--- | :--- | :--- | :--- | :--- |
| **Random Forest** | `models/random_forest_model.pkl` | `(N, 19)` 2D | None | Raw feature values |
| **XGBoost** | `models/xgboost_model.json` | `(N, 19)` 2D | None | Raw feature values |
| **Baseline LSTM** | `models/lstm_model.keras` | `(1, 30, 19)` 3D | `lstm_scaler.pkl` | `StandardScaler` on 30 consecutive cycles |
| **Optimized LSTM** | `models/optimized_lstm_model.keras` | `(1, 30, 19)` 3D | `optimized_lstm_scaler.pkl` | `MinMaxScaler` on 30 consecutive cycles |

### 19 Feature Columns (Exact Order):
`cycle`, `op_setting_1`, `op_setting_2`, `op_setting_3`, `sensor_2`, `sensor_3`, `sensor_4`, `sensor_6`, `sensor_7`, `sensor_8`, `sensor_9`, `sensor_11`, `sensor_12`, `sensor_13`, `sensor_14`, `sensor_15`, `sensor_17`, `sensor_20`, `sensor_21`

*Note: In accordance with project requirements, arbitrary padding or synthetic data fabrication is strictly prohibited. Sequential models require exactly 30 cycles.*

---

## Operational Risk Thresholds (Algorithmic Guidance)

Predicted RUL values are mapped into operational guidance categories:
- **Critical (Immediate Inspection)**: RUL $\le 30$ cycles
- **Warning (Maintenance Planning)**: $30 < \text{RUL} \le 75$ cycles
- **Normal (Nominal Operation)**: $\text{RUL} > 75$ cycles

*Disclaimer: These are heuristic thresholds derived from NASA C-MAPSS simulation benchmarks. They represent condition monitoring aids and must not be used as certified airworthiness assessments.*

---

## Setup & Running the Server

### 1. Activate Environment

**Windows PowerShell**:
```powershell
Set-Location c:\Users\user\Desktop\Industrial_Machine_Failure_Prediction
.\backend\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt**:
```cmd
cd c:\Users\user\Desktop\Industrial_Machine_Failure_Prediction
backend\.venv\Scripts\activate.bat
```

### 2. Run the API Server
```powershell
python backend/app.py
```
The server will start on `http://127.0.0.1:5000`.

---

## API Endpoints

### Health & Models
- `GET /api/health`: Health status, runtime config, loaded models and scalers.
- `GET /api/models`: Model catalog, architectures, input shapes, and benchmark scores.

### Engines & Data
- `GET /api/engines`: List all 100 NASA C-MAPSS test engines, cycle lengths, and ground-truth RUL.
- `GET /api/engines/<engine_id>/trajectory`: Complete cycle history, key degrading sensor curves, and last 30-cycle window for testing.

### Predictions
- `POST /api/predict`:
  - **Option A (Engine ID)**:
    ```json
    { "model": "optimized_lstm", "engine_id": 1 }
    ```
  - **Option B (30-Cycle Sequence)**:
    ```json
    { "model": "optimized_lstm", "sequence": [ { ... 19 features ... }, ... 30 items ] }
    ```
  - **Option C (Single Snapshot Record for Tabular Models)**:
    ```json
    { "model": "random_forest", "record": { "cycle": 100, "op_setting_1": -0.0007, ... } }
    ```
  - **Option D (All Models Side-by-Side Comparison Arena)**:
    ```json
    { "model": "all", "engine_id": 3 }
    ```

### Analytics & Explainability
- `GET /api/analytics/benchmarks`: Official test and validation metrics across all 4 models.
- `GET /api/analytics/feature-importance`: Feature importances for Random Forest and XGBoost.
- `GET /api/analytics/training-history`: 14-epoch training curves for LSTM.
- `GET /api/explainability/shap`: SHAP feature attribution rankings and temporal insights.
