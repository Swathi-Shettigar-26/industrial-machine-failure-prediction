import os
import pandas as pd
from flask import Blueprint, jsonify
import config

analytics_bp = Blueprint("analytics", __name__)

SENSOR_METADATA = {
    "sensor_11": {"name": "Static Pressure at HPC Outlet (Ps30)", "unit": "psia", "type": "Pressure"},
    "sensor_4": {"name": "Total Temperature at LPT Outlet (T50)", "unit": "°R", "type": "Temperature"},
    "sensor_12": {"name": "Ratio of Fuel Flow to Ps30 (phi)", "unit": "pps/psi", "type": "Fuel Flow Ratio"},
    "sensor_9": {"name": "Physical Core Speed (Nc)", "unit": "rpm", "type": "Speed"},
    "sensor_7": {"name": "Total Pressure at HPC Outlet (P30)", "unit": "psia", "type": "Pressure"},
    "sensor_14": {"name": "Corrected Core Speed (NRc)", "unit": "rpm", "type": "Speed"},
    "sensor_8": {"name": "Physical Fan Speed (Nf)", "unit": "rpm", "type": "Speed"},
    "sensor_20": {"name": "HPT Coolant Bleed (W31)", "unit": "lbm/s", "type": "Flow"},
    "sensor_2": {"name": "Total Temperature at LPC Outlet (T24)", "unit": "°R", "type": "Temperature"},
    "sensor_21": {"name": "LPT Coolant Bleed (W32)", "unit": "lbm/s", "type": "Flow"},
    "sensor_17": {"name": "Bleed Enthalpy (htBleed)", "unit": "BTU/lbm", "type": "Enthalpy"},
    "sensor_13": {"name": "Corrected Fan Speed (NRf)", "unit": "rpm", "type": "Speed"},
    "sensor_3": {"name": "Total Temperature at HPC Outlet (T30)", "unit": "°R", "type": "Temperature"},
    "sensor_15": {"name": "Bypass Ratio (BPR)", "unit": "dimensionless", "type": "Ratio"},
    "sensor_6": {"name": "Total Pressure in bypass-duct (P15)", "unit": "psia", "type": "Pressure"},
    "cycle": {"name": "Operational Cycle", "unit": "cycles", "type": "Time"},
    "op_setting_1": {"name": "Operational Setting 1 (Altitude)", "unit": "normalized", "type": "Setting"},
    "op_setting_2": {"name": "Operational Setting 2 (Mach)", "unit": "normalized", "type": "Setting"},
    "op_setting_3": {"name": "Operational Setting 3 (TRA)", "unit": "normalized", "type": "Setting"}
}

@analytics_bp.route("/api/analytics/benchmarks", methods=["GET"])
def get_benchmarks():
    """Returns official test benchmarks and fair validation metrics across all 4 models."""
    official_data = []
    if os.path.exists(config.OFFICIAL_TEST_COMPARISON_PATH):
        df = pd.read_csv(config.OFFICIAL_TEST_COMPARISON_PATH)
        official_data = df.to_dict(orient="records")

    validation_data = []
    if os.path.exists(config.FAIR_MODEL_COMPARISON_PATH):
        df_val = pd.read_csv(config.FAIR_MODEL_COMPARISON_PATH)
        validation_data = df_val.to_dict(orient="records")

    # Include Optuna-optimized LSTM validation metrics if tracked separately
    if os.path.exists(config.OPTIMIZED_METRICS_PATH):
        df_opt = pd.read_csv(config.OPTIMIZED_METRICS_PATH)
        existing_models = [r.get("Model") for r in validation_data]
        for _, opt_row in df_opt.iterrows():
            if opt_row["Model"] not in existing_models:
                validation_data.append({
                    "Model": str(opt_row["Model"]),
                    "MAE": float(opt_row["MAE"]),
                    "RMSE": float(opt_row["RMSE"]),
                    "R2": float(opt_row["R2"]),
                    "NASA_Score": None
                })

    return jsonify({
        "official_test_benchmarks": official_data,
        "validation_benchmarks": validation_data,
        "best_model": "Optimized LSTM",
        "evaluation_criteria": {
            "mae": "Mean Absolute Error in cycles (lower is better)",
            "rmse": "Root Mean Squared Error (penalizes large outliers, lower is better)",
            "r2": "Coefficient of Determination (closer to 1.0 is better)",
            "nasa_score": "Asymmetric NASA penalty score penalizing late predictions heavier than early ones"
        }
    }), 200


@analytics_bp.route("/api/analytics/feature-importance", methods=["GET"])
def get_feature_importance():
    """Returns feature importance comparisons between Random Forest and XGBoost."""
    if not os.path.exists(config.FEATURE_IMPORTANCE_PATH):
        return jsonify({"error": "Feature importance data not found"}), 404

    df = pd.read_csv(config.FEATURE_IMPORTANCE_PATH)
    features = []
    for _, row in df.iterrows():
        f_name = str(row["Feature"])
        meta = SENSOR_METADATA.get(f_name, {"name": f_name, "unit": "-", "type": "General"})
        features.append({
            "feature": f_name,
            "display_name": meta["name"],
            "unit": meta["unit"],
            "type": meta["type"],
            "random_forest": float(row["Random_Forest"]),
            "xgboost": float(row["XGBoost"])
        })

    return jsonify({
        "features": features,
        "top_features": [f["feature"] for f in features[:5]]
    }), 200


@analytics_bp.route("/api/analytics/training-history", methods=["GET"])
def get_training_history():
    """Returns 14-epoch learning curves for the LSTM neural network."""
    if not os.path.exists(config.TRAINING_HISTORY_PATH):
        return jsonify({"error": "Training history not found"}), 404

    df = pd.read_csv(config.TRAINING_HISTORY_PATH)
    records = df.to_dict(orient="records")
    return jsonify({
        "epochs": len(records),
        "history": records
    }), 200
