import math
import numpy as np
import config

class ValidationError(Exception):
    """Raised when user-supplied input data violates schema, sequence length, or numerical constraints."""
    pass


def validate_record_features(record: dict, feature_columns: list) -> list:
    """
    Validates that a single operational record contains all 19 required features
    with non-null, finite numerical values in the exact training order.
    """
    if not isinstance(record, dict):
        raise ValidationError(f"Expected record to be a dictionary, got {type(record).__name__}.")

    missing = [col for col in feature_columns if col not in record]
    if missing:
        raise ValidationError(
            f"Missing required sensor/operational features: {missing}. "
            f"All {len(feature_columns)} features must be explicitly provided."
        )

    # Reject unexpected extra features to guarantee exactly the specified features
    extra = [col for col in record.keys() if col not in feature_columns]
    if extra:
        raise ValidationError(
            f"Unexpected extra feature(s) detected: {extra}. "
            f"Input must contain exactly the {len(feature_columns)} specified features."
        )

    ordered_values = []
    invalid_fields = []
    for col in feature_columns:
        val = record[col]
        try:
            num_val = float(val)
            if math.isnan(num_val) or math.isinf(num_val):
                invalid_fields.append((col, "NaN or Infinity"))
            else:
                ordered_values.append(num_val)
        except (ValueError, TypeError):
            invalid_fields.append((col, f"Non-numeric value: {val}"))

    if invalid_fields:
        raise ValidationError(
            f"Invalid numerical values found in feature inputs: {invalid_fields}"
        )

    return ordered_values


def prepare_tabular_input(data, feature_columns: list) -> np.ndarray:
    """
    Prepares a 2D numpy array of shape (N, 19) for tabular models (Random Forest, XGBoost).
    Accepts:
      - A single feature dictionary: returns (1, 19)
      - A list of feature dictionaries: returns (N, 19)
    """
    if isinstance(data, dict):
        row = validate_record_features(data, feature_columns)
        return np.array([row], dtype=np.float32)

    if isinstance(data, (list, tuple)):
        if len(data) == 0:
            raise ValidationError("Empty input data provided. At least one operational cycle is required.")
        rows = [validate_record_features(item, feature_columns) for item in data]
        return np.array(rows, dtype=np.float32)

    raise ValidationError(
        f"Unsupported input type '{type(data).__name__}'. Expected dictionary or list of dictionaries."
    )


def prepare_sequential_input(sequence_data: list, feature_columns: list, scaler, expected_length: int = 30) -> np.ndarray:
    """
    Prepares a 3D numpy tensor of shape (1, 30, 19) for sequential models (LSTM, Optimized LSTM).
    STRICT CONSTRAINT:
      Does NOT fabricate missing sensor readings or apply silent padding.
      Requires exactly `expected_length` consecutive cycles.
    """
    if not isinstance(sequence_data, (list, tuple)):
        raise ValidationError(
            f"Sequence input must be a list of cycle records, got {type(sequence_data).__name__}."
        )

    actual_length = len(sequence_data)
    if actual_length != expected_length:
        raise ValidationError(
            f"Sequential LSTM prediction requires exactly {expected_length} consecutive operational cycles. "
            f"Received {actual_length} cycles. "
            f"To protect predictive integrity, automatic zero-padding or synthetic sensor fabrication is strictly disabled."
        )

    # Validate each cycle and assemble 2D array
    rows = []
    cycle_numbers = []
    for idx, cycle_record in enumerate(sequence_data):
        row = validate_record_features(cycle_record, feature_columns)
        rows.append(row)
        if "cycle" in cycle_record:
            try:
                cycle_numbers.append(int(cycle_record["cycle"]))
            except (ValueError, TypeError):
                pass

    # If cycle numbers are provided, verify sequential ordering
    if len(cycle_numbers) == expected_length:
        for i in range(1, len(cycle_numbers)):
            if cycle_numbers[i] < cycle_numbers[i - 1]:
                raise ValidationError(
                    f"Sequence cycle numbers must be chronological. Found cycle {cycle_numbers[i]} after {cycle_numbers[i - 1]}."
                )

    raw_matrix = np.array(rows, dtype=np.float32)  # Shape (30, 19)

    # Scale using the model's fitted scaler
    scaled_matrix = scaler.transform(raw_matrix)

    # Reshape to 3D tensor (1, 30, 19)
    tensor = scaled_matrix.reshape(1, expected_length, len(feature_columns))
    return tensor


def get_advisory_status(predicted_rul: float) -> dict:
    """
    Categorizes predicted RUL into application-defined advisory risk stages.
    Maintains a clear distinction between heuristic ML thresholds and certified airworthiness.
    """
    rul_rounded = round(float(predicted_rul), 2)

    if rul_rounded <= config.ADVISORY_CRITICAL_THRESHOLD:
        status = "CRITICAL"
        urgency = "High"
        color = "#EF4444"  # Red
        recommended_action = "Immediate physical borescope and component inspection advised. Schedule engine removal."
    elif rul_rounded <= config.ADVISORY_WARNING_THRESHOLD:
        status = "WARNING"
        urgency = "Moderate"
        color = "#F59E0B"  # Amber
        recommended_action = "Increased degradation detected. Schedule maintenance window and verify lubricating pressure."
    else:
        status = "NORMAL"
        urgency = "Low"
        color = "#10B981"  # Green
        recommended_action = "Engine operating within standard nominal baseline degradation parameters."

    return {
        "status": status,
        "urgency": urgency,
        "color": color,
        "predicted_rul": max(0.0, rul_rounded),
        "recommended_action": recommended_action,
        "is_certified_assessment": False,
        "disclaimer": config.ADVISORY_DISCLAIMER
    }
