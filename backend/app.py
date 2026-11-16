import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS

import config
from services.model_loader import get_registry
from services.dataset_service import get_dataset_service

from routes.health import health_bp
from routes.prediction import prediction_bp
from routes.engines import engines_bp
from routes.analytics import analytics_bp
from routes.explainability import explainability_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s"
)
logger = logging.getLogger("predictive_maintenance_backend")

def create_app() -> Flask:
    """Application factory for the Predictive Maintenance REST API."""
    app = Flask(__name__)

    # CORS configuration
    CORS(
        app,
        resources={r"/api/*": {"origins": config.CORS_ORIGINS}},
        supports_credentials=True
    )
    logger.info("Configured CORS for origins: %s", config.CORS_ORIGINS)

    # Register Blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(engines_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(explainability_bp)

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "error": "Bad Request",
            "message": getattr(error, "description", "The request payload or parameter was invalid.")
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Not Found",
            "message": getattr(error, "description", "The requested API endpoint was not found.")
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method Not Allowed",
            "message": "The HTTP method is not supported for this endpoint."
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        logger.exception("Internal unhandled exception: %s", error)
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected server error occurred."
        }), 500

    # Preload models and datasets at startup
    with app.app_context():
        try:
            logger.info("Pre-warming model registry and test dataset services...")
            get_registry()
            get_dataset_service()
            logger.info("All services and models initialized successfully.")
        except Exception as e:
            logger.exception("Failed during startup artifact initialization: %s", e)

    return app


app = create_app()

if __name__ == "__main__":
    logger.info("Starting Industrial Intelligence Flask API on %s:%d (Debug=%s)", config.HOST, config.PORT, config.DEBUG)
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
