import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODELS_DIR = os.path.join(PROJECT_ROOT, "models")
DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset", "raw")
RESULTS_DIR = os.path.join(PROJECT_ROOT, "results")
VISUALIZATIONS_DIR = os.path.join(PROJECT_ROOT, "visualizations")

# Model Artifact Paths
RF_MODEL_PATH = os.path.join(MODELS_DIR, "random_forest_model.pkl")
XGB_MODEL_PATH = os.path.join(MODELS_DIR, "xgboost_model.json")
LSTM_MODEL_PATH = os.path.join(MODELS_DIR, "lstm_model.keras")
OPT_LSTM_MODEL_PATH = os.path.join(MODELS_DIR, "optimized_lstm_model.keras")
LSTM_SCALER_PATH = os.path.join(MODELS_DIR, "lstm_scaler.pkl")
OPT_LSTM_SCALER_PATH = os.path.join(MODELS_DIR, "optimized_lstm_scaler.pkl")
FEATURE_COLUMNS_PATH = os.path.join(MODELS_DIR, "feature_columns.json")

# Dataset File Paths
TRAIN_FD001_PATH = os.path.join(DATASET_DIR, "train_FD001.txt")
TEST_FD001_PATH = os.path.join(DATASET_DIR, "test_FD001.txt")
RUL_FD001_PATH = os.path.join(DATASET_DIR, "RUL_FD001.txt")
VALIDATION_PROCESSED_PATH = os.path.join(PROJECT_ROOT, "validation_processed.csv")
TRAIN_PROCESSED_PATH = os.path.join(PROJECT_ROOT, "train_processed.csv")

# Results Paths
OFFICIAL_TEST_COMPARISON_PATH = os.path.join(RESULTS_DIR, "final_official_test_comparison.csv")
FAIR_MODEL_COMPARISON_PATH = os.path.join(RESULTS_DIR, "fair_model_comparison.csv")
FEATURE_IMPORTANCE_PATH = os.path.join(RESULTS_DIR, "feature_importance_comparison.csv")
SHAP_IMPORTANCE_PATH = os.path.join(RESULTS_DIR, "lstm_shap_importance.csv")
TRAINING_HISTORY_PATH = os.path.join(RESULTS_DIR, "lstm_training_history.csv")
OPTIMIZED_METRICS_PATH = os.path.join(RESULTS_DIR, "optimized_lstm_metrics.csv")

# Application Settings
SEQUENCE_LENGTH = 30
RUL_CAP = 125

# Advisory Risk Thresholds (Operational Guidance - Not Certified Airworthiness Assessments)
ADVISORY_CRITICAL_THRESHOLD = 30   # RUL <= 30 cycles: High risk / immediate inspection suggested
ADVISORY_WARNING_THRESHOLD = 75    # 30 < RUL <= 75 cycles: Moderate degradation / plan maintenance
# RUL > 75 cycles: Normal operational condition

ADVISORY_DISCLAIMER = (
    "Application-defined heuristic threshold based on NASA C-MAPSS FD001 benchmark criteria. "
    "These classifications represent algorithmic condition monitoring indicators and must not be "
    "construed as certified aviation airworthiness certificates or regulatory maintenance sign-offs."
)

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Flask Server Config
HOST = os.environ.get("FLASK_RUN_HOST", "127.0.0.1")
PORT = int(os.environ.get("FLASK_RUN_PORT", 5000))
DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"
