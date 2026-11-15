
import pandas as pd
from sklearn.model_selection import train_test_split

# Load dataset with generated RUL
data = pd.read_csv('train_with_RUL.csv')

print("Original Dataset Shape:", data.shape)

# Sensors identified as constant or near-constant
# in the FD001 dataset
unwanted_sensors = [
    'sensor_1',
    'sensor_5',
    'sensor_10',
    'sensor_16',
    'sensor_18',
    'sensor_19'
]

# Remove these sensors
data = data.drop(columns=unwanted_sensors)

print("\nRemoved Sensors:", unwanted_sensors)
print("Dataset Shape After Sensor Removal:", data.shape)

# Separate engine IDs
engine_ids = data['engine_id'].unique()

# Split by engine ID, NOT by individual rows
train_ids, val_ids = train_test_split(
    engine_ids,
    test_size=0.20,
    random_state=42
)

# Create training and validation datasets
train_data = data[data['engine_id'].isin(train_ids)].copy()
val_data = data[data['engine_id'].isin(val_ids)].copy()

# Save processed datasets
train_data.to_csv('train_processed.csv', index=False)
val_data.to_csv('validation_processed.csv', index=False)

print("\nTraining Engines:", len(train_ids))
print("Validation Engines:", len(val_ids))

print("Training Dataset Shape:", train_data.shape)
print("Validation Dataset Shape:", val_data.shape)

# Verify there is no engine overlap
overlap = set(train_ids).intersection(set(val_ids))

print("\nEngine Overlap:", len(overlap))

print("\nFeature Engineering Completed!")
