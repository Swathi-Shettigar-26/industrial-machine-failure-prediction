import os
import pandas as pd
from flask import Blueprint, jsonify
import config
from routes.analytics import SENSOR_METADATA

explainability_bp = Blueprint("explainability", __name__)

@explainability_bp.route("/api/explainability/shap", methods=["GET"])
def get_shap_explainability():
    """Returns SHAP (SHapley Additive exPlanations) values for the LSTM model."""
    if not os.path.exists(config.SHAP_IMPORTANCE_PATH):
        return jsonify({"error": "SHAP importance data file not found"}), 404

    df = pd.read_csv(config.SHAP_IMPORTANCE_PATH)
    shap_features = []
    for _, row in df.iterrows():
        f_name = str(row["Feature"])
        meta = SENSOR_METADATA.get(f_name, {"name": f_name, "unit": "-", "type": "General"})
        shap_features.append({
            "feature": f_name,
            "display_name": meta["name"],
            "unit": meta["unit"],
            "type": meta["type"],
            "mean_absolute_shap": float(row["Mean_Absolute_SHAP"])
        })

    # Sort descending
    shap_features.sort(key=lambda x: x["mean_absolute_shap"], reverse=True)

    return jsonify({
        "model": "Baseline LSTM",
        "method": "GradientExplainer (Deep SHAP Attribution)",
        "features": shap_features,
        "key_insights": [
            "Physical Fan Speed (sensor_8) and Static Pressure at HPC Outlet (sensor_11) exhibit the highest gradient-based SHAP attribution.",
            "Temporal heatmap analysis demonstrates that neural network feature attributions concentrate heavily in the final 5-10 cycles of the 30-cycle observation window.",
            "Operating settings (altitude, Mach, TRA) show near-zero SHAP impact in FD001 due to single sea-level operating condition."
        ]
    }), 200
