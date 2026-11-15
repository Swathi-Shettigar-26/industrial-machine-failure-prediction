
import pandas as pd
import numpy as np

# Define columns
columns = (
    ['engine_id', 'cycle']
    + [f'op_setting_{i}' for i in range(1, 4)]
    + [f'sensor_{i}' for i in range(1, 22)]
)

# Load training dataset
train = pd.read_csv(
    'dataset/raw/train_FD001.txt',
    sep=r'\s+',
    header=None,
    names=columns
)

# Select sensor columns
sensor_columns = [
    col for col in train.columns
    if col.startswith('sensor_')
]

# Calculate sensor statistics
sensor_stats = train[sensor_columns].agg(
    ['mean', 'std', 'min', 'max']
).T

# Identify constant sensors
constant_sensors = sensor_stats[
    sensor_stats['std'] == 0
]

# Identify variable sensors
variable_sensors = sensor_stats[
    sensor_stats['std'] > 0
]

print("\n========== SENSOR ANALYSIS ==========")

print("\nAll Sensor Statistics:")
print(sensor_stats.round(4))

print("\n========== CONSTANT SENSORS ==========")
print(constant_sensors)

print("\n========== VARIABLE SENSORS ==========")
print(variable_sensors)

print("\nTotal Sensors:", len(sensor_columns))
print("Constant Sensors:", len(constant_sensors))
print("Variable Sensors:", len(variable_sensors))

# Save analysis
sensor_stats.to_csv(
    'results_sensor_analysis.csv'
)

print("\nAnalysis saved successfully!")
