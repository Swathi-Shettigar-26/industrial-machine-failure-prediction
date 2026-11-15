
import pandas as pd
import matplotlib.pyplot as plt

# Define column names
columns = (
    ['engine_id', 'cycle']
    + [f'op_setting_{i}' for i in range(1, 4)]
    + [f'sensor_{i}' for i in range(1, 22)]
)

# Load dataset
train = pd.read_csv(
    'dataset/raw/train_FD001.txt',
    sep=r'\s+',
    header=None,
    names=columns
)

# Select Engine 1
engine_data = train[train['engine_id'] == 1]

# Sensors to visualize
selected_sensors = [
    'sensor_2',
    'sensor_3',
    'sensor_4',
    'sensor_7',
    'sensor_9',
    'sensor_11',
    'sensor_14',
    'sensor_15',
    'sensor_20',
    'sensor_21'
]

# Create separate plots
fig, axes = plt.subplots(
    5, 2,
    figsize=(14, 18)
)

for ax, sensor in zip(axes.flatten(), selected_sensors):

    ax.plot(
        engine_data['cycle'],
        engine_data[sensor]
    )

    ax.set_title(f'{sensor} vs Operational Cycles')
    ax.set_xlabel('Operational Cycle')
    ax.set_ylabel('Sensor Reading')
    ax.grid(True)

plt.tight_layout()

plt.savefig(
    'sensor_degradation_engine_1.png',
    dpi=300
)

plt.show()
