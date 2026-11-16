import os
import json
import logging
import threading
import joblib
import xgboost as xgb
import keras

import config

logger = logging.getLogger(__name__)

class ModelRegistry:
    """Thread-safe singleton registry for all machine learning models, scalers, and configs."""
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(ModelRegistry, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return

        self._models = {}
        self._scalers = {}
        self._feature_columns = []
        self._metadata = {}
        self._load_artifacts()
        self._initialized = True

    def _load_artifacts(self):
        logger.info("Initializing ML Model Registry...")

        # 1. Feature Columns
        if not os.path.exists(config.FEATURE_COLUMNS_PATH):
            raise FileNotFoundError(f"Feature columns file not found at: {config.FEATURE_COLUMNS_PATH}")
        with open(config.FEATURE_COLUMNS_PATH, "r", encoding="utf-8") as f:
            self._feature_columns = json.load(f)
        logger.info("Loaded %d feature columns: %s", len(self._feature_columns), self._feature_columns)

        # 2. Random Forest Regressor
        if not os.path.exists(config.RF_MODEL_PATH):
            raise FileNotFoundError(f"Random Forest model not found at: {config.RF_MODEL_PATH}")
        self._models["random_forest"] = joblib.load(config.RF_MODEL_PATH)
        logger.info("Loaded Random Forest model successfully.")

        # 3. XGBoost Regressor
        if not os.path.exists(config.XGB_MODEL_PATH):
            raise FileNotFoundError(f"XGBoost model not found at: {config.XGB_MODEL_PATH}")
        xgb_model = xgb.XGBRegressor()
        xgb_model.load_model(config.XGB_MODEL_PATH)
        self._models["xgboost"] = xgb_model
        logger.info("Loaded XGBoost model successfully.")

        # 4. Scalers
        if not os.path.exists(config.LSTM_SCALER_PATH):
            raise FileNotFoundError(f"LSTM scaler not found at: {config.LSTM_SCALER_PATH}")
        self._scalers["lstm"] = joblib.load(config.LSTM_SCALER_PATH)

        if not os.path.exists(config.OPT_LSTM_SCALER_PATH):
            raise FileNotFoundError(f"Optimized LSTM scaler not found at: {config.OPT_LSTM_SCALER_PATH}")
        self._scalers["optimized_lstm"] = joblib.load(config.OPT_LSTM_SCALER_PATH)
        logger.info("Loaded LSTM scalers (StandardScaler & MinMaxScaler) successfully.")

        # 5. Baseline LSTM Keras Model
        if not os.path.exists(config.LSTM_MODEL_PATH):
            raise FileNotFoundError(f"LSTM model not found at: {config.LSTM_MODEL_PATH}")
        self._models["lstm"] = keras.models.load_model(config.LSTM_MODEL_PATH)
        logger.info("Loaded Baseline LSTM model successfully.")

        # 6. Optimized LSTM Keras Model
        if not os.path.exists(config.OPT_LSTM_MODEL_PATH):
            raise FileNotFoundError(f"Optimized LSTM model not found at: {config.OPT_LSTM_MODEL_PATH}")
        self._models["optimized_lstm"] = keras.models.load_model(config.OPT_LSTM_MODEL_PATH)
        logger.info("Loaded Optimized LSTM model successfully.")

        # Cache Model Metadata
        self._metadata = {
            "random_forest": {
                "id": "random_forest",
                "name": "Random Forest Regressor",
                "family": "Ensemble (Bagging)",
                "type": "tabular",
                "input_shape": [19],
                "sequence_required": False,
                "preprocessing": "None (Raw features)",
                "official_metrics": {"mae": 13.3821, "rmse": 17.8955, "r2": 0.8145, "nasa_score": 529.51},
                "description": "Ensemble of 150 regression trees predicting RUL from single-cycle snapshot measurements."
            },
            "xgboost": {
                "id": "xgboost",
                "name": "XGBoost Regressor",
                "family": "Gradient Boosted Decision Trees",
                "type": "tabular",
                "input_shape": [19],
                "sequence_required": False,
                "preprocessing": "None (Raw features)",
                "official_metrics": {"mae": 13.2552, "rmse": 17.6988, "r2": 0.8186, "nasa_score": 543.50},
                "description": "Gradient boosted decision tree model with high sensitivity to key pressure/temperature gradients."
            },
            "lstm": {
                "id": "lstm",
                "name": "Baseline LSTM",
                "family": "Recurrent Deep Neural Network",
                "type": "sequential",
                "input_shape": [30, 19],
                "sequence_required": True,
                "sequence_length": 30,
                "preprocessing": "StandardScaler (Z-score normalization)",
                "official_metrics": {"mae": 10.5960, "rmse": 14.0061, "r2": 0.8864, "nasa_score": 311.91},
                "description": "2-layer LSTM (64 -> 32 units) with dropout (0.2), capturing 30-cycle temporal degradation trajectories."
            },
            "optimized_lstm": {
                "id": "optimized_lstm",
                "name": "Optimized LSTM (Optuna-Tuned)",
                "family": "Optimized Recurrent Deep Neural Network",
                "type": "sequential",
                "input_shape": [30, 19],
                "sequence_required": True,
                "sequence_length": 30,
                "preprocessing": "MinMaxScaler ([0, 1] normalization)",
                "official_metrics": {"mae": 9.9228, "rmse": 13.9583, "r2": 0.8872, "nasa_score": 302.95},
                "description": "Optuna hyperparameter-tuned LSTM (32 -> 16 units, dropout 0.1, dense 32), achieving lowest MAE and lowest NASA penalty score."
            }
        }

    def get_model(self, model_key: str):
        key = model_key.lower().strip()
        alias_map = {
            "rf": "random_forest",
            "xgb": "xgboost",
            "baseline_lstm": "lstm",
            "opt_lstm": "optimized_lstm",
            "opt-lstm": "optimized_lstm"
        }
        canonical_key = alias_map.get(key, key)
        if canonical_key not in self._models:
            raise KeyError(
                f"Unknown model identifier '{model_key}'. "
                f"Available models: {list(self._models.keys())} or aliases {list(alias_map.keys())}"
            )
        return self._models[canonical_key], canonical_key

    def get_scaler(self, model_key: str):
        key = model_key.lower().strip()
        alias_map = {
            "lstm": "lstm",
            "baseline_lstm": "lstm",
            "optimized_lstm": "optimized_lstm",
            "opt_lstm": "optimized_lstm",
            "opt-lstm": "optimized_lstm"
        }
        canonical_key = alias_map.get(key, key)
        if canonical_key not in self._scalers:
            raise KeyError(f"No scaler configured for model key '{model_key}'.")
        return self._scalers[canonical_key]

    @property
    def feature_columns(self):
        return list(self._feature_columns)

    @property
    def metadata(self):
        return dict(self._metadata)


# Convenience singleton accessor
_registry = None

def get_registry() -> ModelRegistry:
    global _registry
    if _registry is None:
        _registry = ModelRegistry()
    return _registry
