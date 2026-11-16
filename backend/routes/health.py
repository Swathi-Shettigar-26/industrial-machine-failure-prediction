from flask import Blueprint, jsonify
from datetime import datetime, timezone
import config
from services.model_loader import get_registry

health_bp = Blueprint("health", __name__)

@health_bp.route("/api/health", methods=["GET"])
def health_check():
    """Returns application health, loaded models status, and environment runtime."""
    registry = get_registry()
    return jsonify({
        "status": "healthy",
        "service": "Industrial Intelligence - Predictive Maintenance API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": {
            "random_forest": "random_forest" in registry._models,
            "xgboost": "xgboost" in registry._models,
            "lstm": "lstm" in registry._models,
            "optimized_lstm": "optimized_lstm" in registry._models
        },
        "scalers_loaded": {
            "standard_scaler": "lstm" in registry._scalers,
            "minmax_scaler": "optimized_lstm" in registry._scalers
        },
        "features_count": len(registry.feature_columns),
        "sequence_length": config.SEQUENCE_LENGTH,
        "rul_cap": config.RUL_CAP
    }), 200


@health_bp.route("/api/models", methods=["GET"])
def list_models():
    """Returns full catalog of available ML models, input shapes, and benchmark scores."""
    registry = get_registry()
    return jsonify({
        "models": list(registry.metadata.values()),
        "feature_columns": registry.feature_columns,
        "recommended_model": "optimized_lstm",
        "advisory_thresholds": {
            "critical_rul_cycles": config.ADVISORY_CRITICAL_THRESHOLD,
            "warning_rul_cycles": config.ADVISORY_WARNING_THRESHOLD,
            "disclaimer": config.ADVISORY_DISCLAIMER
        }
    }), 200
