import time
import logging
import numpy as np

import config
from services.model_loader import get_registry
from services.preprocessing import (
    prepare_tabular_input,
    prepare_sequential_input,
    get_advisory_status,
    ValidationError
)
from services.dataset_service import get_dataset_service

logger = logging.getLogger(__name__)

class PredictionService:
    """Orchestrates RUL predictions across Random Forest, XGBoost, LSTM, and Optimized LSTM."""

    def __init__(self):
        self.registry = get_registry()
        self.dataset_service = get_dataset_service()

    def predict(self, payload: dict) -> dict:
        """
        Main entry point for prediction requests.
        Payload format:
        {
            "model": "optimized_lstm" | "lstm" | "random_forest" | "xgboost" | "all",
            "sequence": [ 30 cycle dicts ] (for LSTM, Opt-LSTM, or 'all')
            OR
            "record": { single cycle dict } (for tabular RF / XGBoost)
            OR
            "engine_id": 1..100 (loads test engine sequence automatically)
        }
        """
        if not isinstance(payload, dict):
            raise ValidationError("Request payload must be a JSON object.")

        model_key = payload.get("model", "optimized_lstm").lower().strip()
        start_time = time.perf_counter()

        # Handle pre-loaded engine_id workflow
        if "engine_id" in payload and payload["engine_id"] is not None:
            return self._predict_engine_id(int(payload["engine_id"]), model_key, start_time)

        # Handle 'all' comparison model
        if model_key in ["all", "compare", "ensemble"]:
            return self._predict_all_models(payload, start_time)

        # Route single model
        model_obj, canonical_key = self.registry.get_model(model_key)
        metadata = self.registry.metadata[canonical_key]
        feature_cols = self.registry.feature_columns

        if metadata["sequence_required"]:
            # LSTM models strictly require 30-cycle sequence
            if "sequence" not in payload:
                raise ValidationError(
                    f"Model '{metadata['name']}' requires a 'sequence' of 30 operational cycles. "
                    f"Provide 'sequence' (list of 30 records) or 'engine_id'."
                )
            sequence_data = payload["sequence"]
            scaler = self.registry.get_scaler(canonical_key)
            tensor = prepare_sequential_input(
                sequence_data,
                feature_cols,
                scaler,
                expected_length=config.SEQUENCE_LENGTH
            )

            # Predict
            pred_raw = model_obj.predict(tensor, verbose=0)
            predicted_rul = float(pred_raw[0][0])
            input_summary = f"Sequential window of {config.SEQUENCE_LENGTH} cycles"
        else:
            # Tabular models (Random Forest, XGBoost)
            if "record" in payload:
                input_data = payload["record"]
                input_summary = "Single snapshot cycle record"
            elif "sequence" in payload:
                # If sequence was sent, evaluate on the most recent cycle in the sequence
                sequence_list = payload["sequence"]
                if not isinstance(sequence_list, list) or len(sequence_list) == 0:
                    raise ValidationError("Sequence list is empty.")
                input_data = sequence_list[-1]
                input_summary = f"Latest cycle ({input_data.get('cycle', 'current')}) from sequence"
            else:
                raise ValidationError(
                    f"Model '{metadata['name']}' requires a 'record' (dict with 19 features) or 'sequence'."
                )

            matrix = prepare_tabular_input(input_data, feature_cols)
            pred_raw = model_obj.predict(matrix)
            predicted_rul = float(pred_raw[0])

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        advisory = get_advisory_status(predicted_rul)

        return {
            "model_id": canonical_key,
            "model_name": metadata["name"],
            "model_type": metadata["type"],
            "preprocessing": metadata["preprocessing"],
            "predicted_rul": advisory["predicted_rul"],
            "advisory": advisory,
            "input_type": input_summary,
            "data_source": "Manual What-If Simulation (User-Supplied Input)",
            "is_manual_input": True,
            "execution_time_ms": elapsed_ms
        }

    def _predict_engine_id(self, engine_id: int, model_key: str, start_time: float) -> dict:
        """Loads the official test engine trajectory and predicts RUL at cutoff cycle."""
        traj = self.dataset_service.get_engine_trajectory(engine_id)
        if not traj["has_full_lstm_sequence"]:
            raise ValidationError(
                f"Test Engine {engine_id} has only {traj['recorded_cycles']} cycles, "
                f"which is less than the required {config.SEQUENCE_LENGTH} cycles for sequential prediction."
            )

        sub_payload = {
            "model": model_key,
            "sequence": traj["last_30_cycles"]
        }

        if model_key in ["all", "compare", "ensemble"]:
            result = self._predict_all_models(sub_payload, start_time)
        else:
            result = self.predict(sub_payload)

        # Mark official NASA telemetry
        result["data_source"] = f"NASA C-MAPSS FD001 Telemetry (Engine #{engine_id})"
        result["is_manual_input"] = False

        # Attach ground truth reference
        result["engine_reference"] = {
            "engine_id": engine_id,
            "cutoff_cycle": traj["recorded_cycles"],
            "actual_rul_ground_truth": traj["final_actual_rul"],
            "rul_error": round(abs(result.get("predicted_rul", 0) - traj["final_actual_rul"]), 2)
            if "predicted_rul" in result else None
        }
        return result

    def _predict_all_models(self, payload: dict, start_time: float) -> dict:
        """Runs all 4 models on the same 30-cycle engine sequence for direct comparison."""
        if "sequence" not in payload:
            raise ValidationError(
                "Multi-model comparison requires a 'sequence' of 30 operational cycles so both "
                "tabular snapshot models and sequential deep learning models can be evaluated."
            )

        sequence_data = payload["sequence"]
        feature_cols = self.registry.feature_columns

        # 1. Tabular input (latest cycle)
        latest_record = sequence_data[-1]
        tabular_matrix = prepare_tabular_input(latest_record, feature_cols)

        # 2. Sequential inputs with respective scalers
        lstm_scaler = self.registry.get_scaler("lstm")
        opt_scaler = self.registry.get_scaler("optimized_lstm")

        tensor_lstm = prepare_sequential_input(sequence_data, feature_cols, lstm_scaler, config.SEQUENCE_LENGTH)
        tensor_opt = prepare_sequential_input(sequence_data, feature_cols, opt_scaler, config.SEQUENCE_LENGTH)

        # Execute predictions
        rf_model, _ = self.registry.get_model("random_forest")
        xgb_model, _ = self.registry.get_model("xgboost")
        lstm_model, _ = self.registry.get_model("lstm")
        opt_model, _ = self.registry.get_model("optimized_lstm")

        rf_rul = float(rf_model.predict(tabular_matrix)[0])
        xgb_rul = float(xgb_model.predict(tabular_matrix)[0])
        lstm_rul = float(lstm_model.predict(tensor_lstm, verbose=0)[0][0])
        opt_rul = float(opt_model.predict(tensor_opt, verbose=0)[0][0])

        predictions = {
            "random_forest": {
                "name": "Random Forest",
                "predicted_rul": round(max(0.0, rf_rul), 2),
                "advisory": get_advisory_status(rf_rul),
                "benchmark_mae": 13.38
            },
            "xgboost": {
                "name": "XGBoost",
                "predicted_rul": round(max(0.0, xgb_rul), 2),
                "advisory": get_advisory_status(xgb_rul),
                "benchmark_mae": 13.25
            },
            "lstm": {
                "name": "Baseline LSTM",
                "predicted_rul": round(max(0.0, lstm_rul), 2),
                "advisory": get_advisory_status(lstm_rul),
                "benchmark_mae": 10.60
            },
            "optimized_lstm": {
                "name": "Optimized LSTM (Best)",
                "predicted_rul": round(max(0.0, opt_rul), 2),
                "advisory": get_advisory_status(opt_rul),
                "benchmark_mae": 9.92
            }
        }

        # Optimized LSTM is our primary recommended model
        primary_advisory = get_advisory_status(opt_rul)
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "mode": "all_models_comparison",
            "primary_model": "optimized_lstm",
            "predicted_rul": primary_advisory["predicted_rul"],
            "advisory": primary_advisory,
            "models_comparison": predictions,
            "cycle_evaluated": latest_record.get("cycle", 30),
            "data_source": "Manual What-If Simulation (User-Supplied Input)",
            "is_manual_input": True,
            "execution_time_ms": elapsed_ms
        }


# Singleton accessor
_prediction_service = None

def get_prediction_service() -> PredictionService:
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService()
    return _prediction_service
