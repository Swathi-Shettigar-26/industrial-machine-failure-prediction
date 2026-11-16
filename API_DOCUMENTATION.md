# Industrial Intelligence – REST API Documentation

Comprehensive technical documentation for the Predictive Maintenance & Remaining Useful Life (RUL) Estimation REST API service.

---

## 1. Overview & Service Architecture

The backend REST API is built with Python 3.11 and Flask. It serves four trained machine learning and deep learning models for turbofan engine Remaining Useful Life estimation, streams NASA C-MAPSS FD001 engine trajectories, validates operational sensor records, and provides explainability and benchmarking endpoints.

* **Base URL:** `http://127.0.0.1:5000`
* **Default Port:** `5000`
* **Content-Type:** `application/json`
* **CORS Support:** Pre-configured for `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, and `http://127.0.0.1:3000`.

---

## 2. Global Error Handling & Response Format

All error responses return standard JSON error structures:

```json
{
  "error": "Validation Error",
  "message": "Sequential LSTM prediction requires exactly 30 consecutive operational cycles. Received 29 cycles."
}
```

### Standard HTTP Status Codes

| Code | Status | Description |
| :--- | :--- | :--- |
| `200` | OK | Request executed successfully. |
| `400` | Bad Request / Validation Error | Input missing, extraneous features, non-numeric values, or sequence length $\neq 30$. |
| `404` | Not Found | Requested endpoint or Engine ID does not exist. |
| `405` | Method Not Allowed | Invalid HTTP method (e.g. GET instead of POST). |
| `500` | Internal Server Error | Unhandled runtime exception during computation. |

---

## 3. Endpoints Specification

### 3.1 Health & Service Inspection

#### `GET /api/health`
Checks application health, memory-resident model status, active scalers, and global hyperparameters.

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "status": "healthy",
  "service": "Industrial Intelligence - Predictive Maintenance API",
  "timestamp": "2026-11-15T14:09:15.836000+00:00",
  "models_loaded": {
    "random_forest": true,
    "xgboost": true,
    "lstm": true,
    "optimized_lstm": true
  },
  "scalers_loaded": {
    "standard_scaler": true,
    "minmax_scaler": true
  },
  "features_count": 19,
  "sequence_length": 30,
  "rul_cap": 125
}
```

---

#### `GET /api/models`
Returns the operational model catalog, model families, required input shapes, preprocessors, and official test metrics.

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "recommended_model": "optimized_lstm",
  "feature_columns": [
    "cycle", "op_setting_1", "op_setting_2", "op_setting_3",
    "sensor_2", "sensor_3", "sensor_4", "sensor_6", "sensor_7",
    "sensor_8", "sensor_9", "sensor_11", "sensor_12", "sensor_13",
    "sensor_14", "sensor_15", "sensor_17", "sensor_20", "sensor_21"
  ],
  "advisory_thresholds": {
    "critical_rul_cycles": 30,
    "warning_rul_cycles": 75,
    "disclaimer": "Application-defined heuristic threshold based on NASA C-MAPSS FD001 benchmark criteria..."
  },
  "models": [
    {
      "id": "random_forest",
      "name": "Random Forest Regressor",
      "family": "Ensemble (Bagging)",
      "type": "tabular",
      "input_shape": [19],
      "sequence_required": false,
      "preprocessing": "None (Raw features)",
      "official_metrics": { "mae": 13.3821, "rmse": 17.8955, "r2": 0.8145, "nasa_score": 529.51 }
    },
    {
      "id": "xgboost",
      "name": "XGBoost Regressor",
      "family": "Gradient Boosted Decision Trees",
      "type": "tabular",
      "input_shape": [19],
      "sequence_required": false,
      "preprocessing": "None (Raw features)",
      "official_metrics": { "mae": 13.2552, "rmse": 17.6988, "r2": 0.8186, "nasa_score": 543.50 }
    },
    {
      "id": "lstm",
      "name": "Baseline LSTM",
      "family": "Recurrent Deep Neural Network",
      "type": "sequential",
      "input_shape": [30, 19],
      "sequence_required": true,
      "preprocessing": "StandardScaler (Z-score normalization)",
      "official_metrics": { "mae": 10.5960, "rmse": 14.0061, "r2": 0.8864, "nasa_score": 311.91 }
    },
    {
      "id": "optimized_lstm",
      "name": "Optimized LSTM (Optuna-Tuned)",
      "family": "Optimized Recurrent Deep Neural Network",
      "type": "sequential",
      "input_shape": [30, 19],
      "sequence_required": true,
      "preprocessing": "MinMaxScaler ([0, 1] normalization)",
      "official_metrics": { "mae": 9.9228, "rmse": 13.9583, "r2": 0.8872, "nasa_score": 302.95 }
    }
  ]
}
```

---

### 3.2 Engines & Sensor Trajectories

#### `GET /api/engines`
Returns the catalog of all 100 test engines in NASA C-MAPSS FD001, recorded cycles at test cutoff, and ground-truth RUL.

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "total_engines": 100,
  "dataset": "NASA C-MAPSS FD001 Test Set",
  "engines": [
    {
      "engine_id": 1,
      "recorded_cycles": 31,
      "cutoff_cycle": 31,
      "final_actual_rul": 112,
      "is_lstm_ready": true
    },
    {
      "engine_id": 2,
      "recorded_cycles": 49,
      "cutoff_cycle": 49,
      "final_actual_rul": 98,
      "is_lstm_ready": true
    }
  ]
}
```

---

#### `GET /api/engines/<engine_id>/trajectory`
Returns full cycle history, 14 variable sensor trajectories, and the pre-assembled 30-cycle cutoff window for the specified engine.

* **Method:** `GET`
* **URL Parameter:** `engine_id` (integer, `1` through `100`)
* **Success Response (`200 OK`):**
```json
{
  "engine_id": 1,
  "recorded_cycles": 31,
  "final_actual_rul": 112,
  "has_full_lstm_sequence": true,
  "cycle_numbers": [1, 2, 3, "...", 31],
  "sensor_trends": {
    "sensor_11": [47.05, 47.12, 47.20, "..."],
    "sensor_4": [1398.2, 1400.1, 1402.5, "..."],
    "sensor_12": [521.8, 521.6, 521.4, "..."],
    "sensor_9": [9050.2, 9052.1, 9055.3, "..."],
    "sensor_7": [554.2, 553.8, 553.5, "..."]
  },
  "last_30_cycles": [
    {
      "cycle": 2, "op_setting_1": -0.0027, "op_setting_2": -0.0003, "op_setting_3": 100.0,
      "sensor_2": 641.89, "sensor_3": 1583.85, "sensor_4": 1400.85, "sensor_6": 21.61,
      "sensor_7": 553.59, "sensor_8": 2388.16, "sensor_9": 9048.70, "sensor_11": 47.47,
      "sensor_12": 521.95, "sensor_13": 2388.16, "sensor_14": 8130.34, "sensor_15": 8.4414,
      "sensor_17": 393.00, "sensor_20": 38.88, "sensor_21": 23.3734
    }
  ],
  "latest_single_cycle": { "cycle": 31, "sensor_11": 47.45, "..." : "..." }
}
```

---

### 3.3 Prediction Engine

#### `POST /api/predict`
Main inference endpoint. Supports four execution options:

#### Option A: Predict via Test Engine ID (Official Telemetry)
```json
{
  "model": "optimized_lstm",
  "engine_id": 1
}
```
**Response (`200 OK`):**
```json
{
  "model_id": "optimized_lstm",
  "model_name": "Optimized LSTM (Optuna-Tuned)",
  "model_type": "sequential",
  "preprocessing": "MinMaxScaler ([0, 1] normalization)",
  "predicted_rul": 120.23,
  "advisory": {
    "status": "NORMAL",
    "urgency": "Low",
    "color": "#10B981",
    "predicted_rul": 120.23,
    "recommended_action": "Engine operating within standard nominal baseline degradation parameters.",
    "is_certified_assessment": false,
    "disclaimer": "Application-defined heuristic threshold based on NASA C-MAPSS FD001 benchmark criteria..."
  },
  "input_type": "Sequential window of 30 cycles",
  "data_source": "NASA C-MAPSS FD001 Telemetry (Engine #1)",
  "is_manual_input": false,
  "engine_reference": {
    "engine_id": 1,
    "cutoff_cycle": 31,
    "actual_rul_ground_truth": 112,
    "rul_error": 8.23
  },
  "execution_time_ms": 28.5
}
```

---

#### Option B: Predict Single Tabular Cycle (Random Forest or XGBoost)
```json
{
  "model": "random_forest",
  "record": {
    "cycle": 100,
    "op_setting_1": -0.0007,
    "op_setting_2": -0.0004,
    "op_setting_3": 100.0,
    "sensor_2": 642.50,
    "sensor_3": 1588.00,
    "sensor_4": 1405.00,
    "sensor_6": 21.61,
    "sensor_7": 553.80,
    "sensor_8": 2388.08,
    "sensor_9": 9055.00,
    "sensor_11": 47.45,
    "sensor_12": 521.80,
    "sensor_13": 2388.07,
    "sensor_14": 8135.00,
    "sensor_15": 8.43,
    "sensor_17": 393.00,
    "sensor_20": 38.85,
    "sensor_21": 23.35
  }
}
```
**Response (`200 OK`):**
```json
{
  "model_id": "random_forest",
  "model_name": "Random Forest Regressor",
  "model_type": "tabular",
  "preprocessing": "None (Raw features)",
  "predicted_rul": 100.58,
  "advisory": {
    "status": "NORMAL",
    "urgency": "Low",
    "color": "#10B981",
    "predicted_rul": 100.58,
    "recommended_action": "Engine operating within standard nominal baseline degradation parameters.",
    "is_certified_assessment": false
  },
  "input_type": "Single snapshot cycle record",
  "data_source": "Manual What-If Simulation (User-Supplied Input)",
  "is_manual_input": true,
  "execution_time_ms": 14.2
}
```

---

#### Option C: Predict 30-Cycle Custom Sequence (Sequential LSTM)
```json
{
  "model": "optimized_lstm",
  "sequence": [
    { "cycle": 1, "op_setting_1": -0.0007, "... 19 features ..." : "..." },
    "..."
  ]
}
```
*Note: The array must contain exactly 30 chronological objects, each containing the exact 19 feature keys.*

---

#### Option D: Four-Model Multi-Comparison Arena
```json
{
  "model": "all",
  "engine_id": 1
}
```
**Response (`200 OK`):**
```json
{
  "mode": "all_models_comparison",
  "primary_model": "optimized_lstm",
  "predicted_rul": 120.23,
  "advisory": {
    "status": "NORMAL",
    "urgency": "Low",
    "color": "#10B981",
    "predicted_rul": 120.23,
    "recommended_action": "Engine operating within standard nominal baseline degradation parameters."
  },
  "models_comparison": {
    "random_forest": {
      "name": "Random Forest",
      "predicted_rul": 123.73,
      "benchmark_mae": 13.38
    },
    "xgboost": {
      "name": "XGBoost",
      "predicted_rul": 123.32,
      "benchmark_mae": 13.25
    },
    "lstm": {
      "name": "Baseline LSTM",
      "predicted_rul": 118.63,
      "benchmark_mae": 10.60
    },
    "optimized_lstm": {
      "name": "Optimized LSTM (Best)",
      "predicted_rul": 120.23,
      "benchmark_mae": 9.92
    }
  },
  "data_source": "NASA C-MAPSS FD001 Telemetry (Engine #1)",
  "is_manual_input": false,
  "execution_time_ms": 42.1
}
```

---

### 3.4 Benchmarks & Explainability

#### `GET /api/analytics/benchmarks`
Returns both official NASA FD001 test metrics (100 engines) and internal fair validation metrics (20 held-out engines from an 80/20 engine-based split, evaluated without overlap).

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "best_model": "Optimized LSTM",
  "official_test_benchmarks": [
    { "Model": "Random Forest", "MAE": 13.382132, "RMSE": 17.895515, "R2": 0.814549, "NASA_Score": 529.512747 },
    { "Model": "XGBoost", "MAE": 13.255241, "RMSE": 17.698838, "R2": 0.818603, "NASA_Score": 543.504448 },
    { "Model": "Original LSTM", "MAE": 10.596, "RMSE": 14.0061, "R2": 0.8864, "NASA_Score": 311.9109 },
    { "Model": "Optimized LSTM", "MAE": 9.9228, "RMSE": 13.9583, "R2": 0.8872, "NASA_Score": 302.9545 }
  ],
  "validation_benchmarks": [
    { "Model": "Random Forest", "MAE": 12.4565, "RMSE": 17.1984, "R2": 0.8303, "NASA_Score": 22277.49 },
    { "Model": "XGBoost", "MAE": 12.3260, "RMSE": 16.7594, "R2": 0.8389, "NASA_Score": 19680.41 },
    { "Model": "LSTM", "MAE": 9.2978, "RMSE": 12.4565, "R2": 0.9110, "NASA_Score": 10080.01 },
    { "Model": "Optimized LSTM", "MAE": 7.9672, "RMSE": 11.5566, "R2": 0.9234, "NASA_Score": null }
  ]
}
```

---

#### `GET /api/analytics/feature-importance`
Returns tree-based split importances (Gini Impurity for Random Forest, Gradient Gain for XGBoost).

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "top_features": ["sensor_11", "cycle", "sensor_4", "sensor_12", "sensor_15"],
  "features": [
    {
      "feature": "sensor_11",
      "display_name": "Static Pressure at HPC Outlet (Ps30)",
      "unit": "psia",
      "type": "Pressure",
      "random_forest": 0.501704,
      "xgboost": 0.399504
    },
    {
      "feature": "cycle",
      "display_name": "Operational Cycle",
      "unit": "cycles",
      "type": "Time",
      "random_forest": 0.261043,
      "xgboost": 0.198880
    }
  ]
}
```

---

#### `GET /api/explainability/shap`
Returns global Deep SHAP feature attributions computed via `GradientExplainer` on the 30-cycle sequential LSTM.

* **Method:** `GET`
* **Success Response (`200 OK`):**
```json
{
  "model": "Baseline LSTM",
  "method": "GradientExplainer (Deep SHAP Attribution)",
  "features": [
    {
      "feature": "sensor_8",
      "display_name": "Physical Fan Speed (Nf)",
      "unit": "rpm",
      "type": "Speed",
      "mean_absolute_shap": 0.625621
    },
    {
      "feature": "sensor_11",
      "display_name": "Static Pressure at HPC Outlet (Ps30)",
      "unit": "psia",
      "type": "Pressure",
      "mean_absolute_shap": 0.577001
    },
    {
      "feature": "sensor_7",
      "display_name": "Total Pressure at HPC Outlet (P30)",
      "unit": "psia",
      "type": "Pressure",
      "mean_absolute_shap": 0.506873
    }
  ],
  "key_insights": [
    "Physical Fan Speed (sensor_8) and Static Pressure at HPC Outlet (sensor_11) exhibit the highest gradient-based SHAP attribution.",
    "Temporal heatmap analysis demonstrates that neural network feature attributions concentrate heavily in the final 5-10 cycles of the 30-cycle observation window.",
    "Operating settings (altitude, Mach, TRA) show near-zero SHAP impact in FD001 due to single sea-level operating condition."
  ]
}
```

---

## 4. Input Constraints & Validation Rules

1. **Feature Column Order:** All models strictly require features to follow the exact order in `feature_columns.json`:
   `cycle`, `op_setting_1`, `op_setting_2`, `op_setting_3`, `sensor_2`, `sensor_3`, `sensor_4`, `sensor_6`, `sensor_7`, `sensor_8`, `sensor_9`, `sensor_11`, `sensor_12`, `sensor_13`, `sensor_14`, `sensor_15`, `sensor_17`, `sensor_20`, `sensor_21`.
2. **Cardinality:** Exactly 19 features must be provided. Extraneous keys or omitted keys trigger immediate HTTP 400 rejection.
3. **Sequence Length:** Sequential models (`lstm`, `optimized_lstm`, `all`) require **exactly 30 consecutive operational cycles**. Zero-padding, forward-filling, or synthetic sensor generation is strictly disabled.
4. **Chronology:** When cycle numbers are provided, they must be chronological ($t_k > t_{k-1}$).
5. **Data Types:** All sensor readings must be finite floating-point numbers (`NaN`, `Infinity`, and non-numeric strings are rejected).
