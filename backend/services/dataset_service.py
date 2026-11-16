import os
import logging
import pandas as pd
import config
from services.model_loader import get_registry

logger = logging.getLogger(__name__)

class DatasetService:
    """Manages NASA C-MAPSS FD001 test data, engine trajectories, and ground-truth references."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatasetService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return

        self._test_df = None
        self._rul_df = None
        self._engine_summaries = []
        self._load_datasets()
        self._initialized = True

    def _load_datasets(self):
        logger.info("Loading C-MAPSS FD001 test datasets...")
        columns = (
            ["engine_id", "cycle"]
            + [f"op_setting_{i}" for i in range(1, 4)]
            + [f"sensor_{i}" for i in range(1, 22)]
        )

        if not os.path.exists(config.TEST_FD001_PATH):
            raise FileNotFoundError(f"Test dataset not found at {config.TEST_FD001_PATH}")
        if not os.path.exists(config.RUL_FD001_PATH):
            raise FileNotFoundError(f"RUL dataset not found at {config.RUL_FD001_PATH}")

        self._test_df = pd.read_csv(
            config.TEST_FD001_PATH,
            sep=r"\s+",
            header=None,
            names=columns
        )

        self._rul_df = pd.read_csv(
            config.RUL_FD001_PATH,
            header=None,
            names=["actual_rul"]
        )

        # Build Engine Summaries (Engines 1 to 100)
        engine_ids = sorted(self._test_df["engine_id"].unique())
        self._engine_summaries = []

        for e_id in engine_ids:
            engine_subset = self._test_df[self._test_df["engine_id"] == e_id]
            max_cycle = int(engine_subset["cycle"].max())
            # Engine IDs are 1-indexed, RUL file is 0-indexed row per engine
            actual_rul = int(self._rul_df.iloc[e_id - 1]["actual_rul"])

            self._engine_summaries.append({
                "engine_id": int(e_id),
                "recorded_cycles": max_cycle,
                "cutoff_cycle": max_cycle,
                "final_actual_rul": actual_rul,
                "is_lstm_ready": max_cycle >= config.SEQUENCE_LENGTH
            })

        logger.info("Loaded %d test engines successfully.", len(self._engine_summaries))

    def get_engines(self) -> list:
        return list(self._engine_summaries)

    def get_engine_summary(self, engine_id: int) -> dict:
        for eng in self._engine_summaries:
            if eng["engine_id"] == engine_id:
                return eng
        raise KeyError(f"Engine ID {engine_id} not found in test dataset (valid range: 1 to 100).")

    def get_engine_trajectory(self, engine_id: int) -> dict:
        summary = self.get_engine_summary(engine_id)
        engine_data = self._test_df[self._test_df["engine_id"] == engine_id].sort_values("cycle")

        registry = get_registry()
        feature_cols = registry.feature_columns

        # Convert records to dictionary list
        trajectory_records = engine_data[feature_cols].to_dict(orient="records")

        # Extract last 30 cycles if available
        last_30_cycles = None
        if len(trajectory_records) >= config.SEQUENCE_LENGTH:
            last_30_cycles = trajectory_records[-config.SEQUENCE_LENGTH:]

        # Extract degrading sensor series for trajectory inspection across variable channels
        timeline_sensors = [
            "sensor_11", "sensor_4", "sensor_12", "sensor_9", "sensor_7",
            "sensor_2", "sensor_3", "sensor_8", "sensor_13", "sensor_14",
            "sensor_15", "sensor_17", "sensor_20", "sensor_21"
        ]
        sensor_trends = {
            s: [float(val) for val in engine_data[s].tolist()]
            for s in timeline_sensors if s in engine_data.columns
        }

        return {
            "engine_id": engine_id,
            "recorded_cycles": summary["recorded_cycles"],
            "final_actual_rul": summary["final_actual_rul"],
            "cycle_numbers": [int(c) for c in engine_data["cycle"].tolist()],
            "sensor_trends": sensor_trends,
            "has_full_lstm_sequence": last_30_cycles is not None,
            "last_30_cycles": last_30_cycles,
            "latest_single_cycle": trajectory_records[-1] if trajectory_records else None
        }


# Singleton accessor
_dataset_service = None

def get_dataset_service() -> DatasetService:
    global _dataset_service
    if _dataset_service is None:
        _dataset_service = DatasetService()
    return _dataset_service
