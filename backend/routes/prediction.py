from flask import Blueprint, request, jsonify
import logging
from services.prediction_service import get_prediction_service
from services.preprocessing import ValidationError

logger = logging.getLogger(__name__)
prediction_bp = Blueprint("prediction", __name__)

@prediction_bp.route("/api/predict", methods=["POST"])
def predict_rul():
    """
    Predicts Remaining Useful Life using the specified model.
    Accepts:
      - model: "optimized_lstm" | "lstm" | "random_forest" | "xgboost" | "all"
      - sequence: list of 30 cycle dictionaries (each containing 19 features)
      - record: single cycle dictionary (19 features, for RF and XGBoost)
      - engine_id: integer 1..100 (loads test engine sequence directly)
    """
    if not request.is_json:
        return jsonify({
            "error": "Invalid Content-Type",
            "message": "Request header 'Content-Type' must be 'application/json'."
        }), 400

    payload = request.get_json()
    if not payload:
        return jsonify({
            "error": "Empty Payload",
            "message": "JSON body cannot be empty."
        }), 400

    service = get_prediction_service()
    try:
        result = service.predict(payload)
        return jsonify(result), 200
    except ValidationError as ve:
        logger.warning("Prediction validation failed: %s", str(ve))
        return jsonify({
            "error": "Validation Error",
            "message": str(ve)
        }), 400
    except KeyError as ke:
        logger.warning("Resource lookup failed: %s", str(ke))
        return jsonify({
            "error": "Not Found",
            "message": str(ke)
        }), 404
    except Exception as exc:
        logger.exception("Unexpected error during RUL prediction.")
        return jsonify({
            "error": "Internal Prediction Error",
            "message": "An unexpected error occurred while processing the prediction request."
        }), 500
