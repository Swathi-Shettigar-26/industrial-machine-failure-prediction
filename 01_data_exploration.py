
import numpy as np
import pandas as pd

# Define column names
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

# Load testing dataset
test = pd.read_csv(
    'dataset/raw/test_FD001.txt',
    sep=r'\s+',
    header=None,
    names=columns
)

# Load actual test RUL
rul = pd.read_csv(
    'dataset/raw/RUL_FD001.txt',
    header=None,
    names=['RUL']
)

# Display information
print("\n========== DATASET SHAPES ==========")
print("Training:", train.shape)
print("Testing:", test.shape)
print("RUL:", rul.shape)

print("\n========== FIRST FIVE ROWS ==========")
print(train.head())

print("\n========== DATASET SUMMARY ==========")
print(train.describe())

print("\n========== MISSING VALUES ==========")
print(train.isnull().sum().sum())

print("\n========== UNIQUE ENGINES ==========")
print(train['engine_id'].nunique())
