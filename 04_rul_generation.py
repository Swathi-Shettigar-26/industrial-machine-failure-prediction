
import pandas as pd
import numpy as np

# Define dataset columns
columns = (
    ['engine_id', 'cycle'] +
    [f'op_setting_{i}' for i in range(1, 4)] +
    [f'sensor_{i}' for i in range(1, 22)]
)

# Load training dataset
train = pd.read_csv(
    'dataset/raw/train_FD001.txt',
    sep=r'\s+',
    header=None,
    names=columns
)

# Calculate maximum cycle for every engine
max_cycles = train.groupby('engine_id')['cycle'].max()

# Generate RUL
train['RUL'] = train.apply(
    lambda row: max_cycles[row['engine_id']] - row['cycle'],
    axis=1
)

# Apply RUL capping
RUL_CAP = 125
train['RUL'] = np.minimum(train['RUL'], RUL_CAP)

# Display results
print("Dataset Shape:", train.shape)
print("\nSample RUL values:")
print(train[['engine_id', 'cycle', 'RUL']].head(15))

print("\nRUL Statistics:")
print(train['RUL'].describe())

# Save processed dataset
train.to_csv('train_with_RUL.csv', index=False)

print("\nRUL generation completed!")
print("Saved as train_with_RUL.csv")
