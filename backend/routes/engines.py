from flask import Blueprint, jsonify
import logging
from services.dataset_service import get_dataset_service

logger = logging.getLogger(__name__)
engines_bp = Blueprint("engines", __name__)

@engines_bp.route("/api/engines", methods=["GET"])
def list_test_engines():
    """
    Returns the list of 100 NASA C-MAPSS FD001 test engines,
    including recorded cycles and official ground-truth cutoff RUL.
    """
    dataset_service = get_dataset_service()
    engines = dataset_service.get_engines()
    return jsonify({
        "total_engines": len(engines),
        "dataset": "NASA C-MAPSS FD001 Test Set",
        "engines": engines
    }), 200


@engines_bp.route("/api/engines/<int:engine_id>/trajectory", methods=["GET"])
def get_engine_trajectory(engine_id: int):
    """
    Returns cycle-by-cycle sensor readings, degraded trendlines,
    and pre-assembled 30-cycle sequential windows for the specified engine.
    """
    dataset_service = get_dataset_service()
    try:
        trajectory = dataset_service.get_engine_trajectory(engine_id)
        return jsonify(trajectory), 200
    except KeyError as ke:
        return jsonify({
            "error": "Engine Not Found",
            "message": str(ke)
        }), 404
    except Exception as exc:
        logger.exception("Failed to load trajectory for engine %s.", engine_id)
        return jsonify({
            "error": "Internal Error",
            "message": f"Could not retrieve trajectory for engine ID {engine_id}."
        }), 500
