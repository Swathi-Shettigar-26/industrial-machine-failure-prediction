
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

# Load LSTM predictions
data = pd.read_csv('results/lstm_predictions.csv')

actual = data['Actual_RUL'].to_numpy()
predicted = data['Predicted_RUL'].to_numpy()

# Calculate errors
errors = predicted - actual
absolute_errors = np.abs(errors)

os.makedirs('visualizations', exist_ok=True)

# 1. Error Distribution
plt.figure(figsize=(9, 5))
plt.hist(errors, bins=40, edgecolor='black')
plt.axvline(0, linestyle='--', label='Zero Error')
plt.xlabel('Prediction Error')
plt.ylabel('Number of Predictions')
plt.title('LSTM Prediction Error Distribution')
plt.legend()
plt.tight_layout()
plt.savefig('visualizations/error_distribution.png', dpi=300)
plt.close()

# 2. MAE by RUL Range
ranges = [0, 30, 60, 90, 126]
labels = ['0-30', '31-60', '61-90', '91-125']

data['RUL_Range'] = pd.cut(
    actual,
    bins=ranges,
    labels=labels,
    include_lowest=True
)

data['Absolute_Error'] = absolute_errors

range_analysis = data.groupby(
    'RUL_Range', observed=False
)['Absolute_Error'].agg(['count', 'mean'])

print("\nMAE BY RUL RANGE")
print(range_analysis)

plt.figure(figsize=(9, 5))
plt.bar(
    range_analysis.index.astype(str),
    range_analysis['mean']
)
plt.xlabel('Actual RUL Range')
plt.ylabel('Mean Absolute Error')
plt.title('LSTM Prediction Error Across RUL Ranges')
plt.tight_layout()
plt.savefig('visualizations/mae_by_rul_range.png', dpi=300)
plt.close()

# 3. Actual vs Predicted
plt.figure(figsize=(7, 7))
plt.scatter(actual, predicted, alpha=0.35)
plt.plot([0, 130], [0, 130], 'r--', label='Perfect Prediction')
plt.xlabel('Actual RUL')
plt.ylabel('Predicted RUL')
plt.title('LSTM: Actual vs Predicted RUL')
plt.legend()
plt.tight_layout()
plt.savefig('visualizations/actual_vs_predicted_lstm.png', dpi=300)
plt.close()

# 4. Overprediction vs Underprediction
over = np.sum(errors > 0)
under = np.sum(errors < 0)
exact = np.sum(errors == 0)

print("\nPREDICTION ERROR ANALYSIS")
print("Overpredictions:", over)
print("Underpredictions:", under)
print("Exact predictions:", exact)

plt.figure(figsize=(7, 5))
plt.bar(
    ['Overprediction', 'Underprediction', 'Exact'],
    [over, under, exact]
)
plt.ylabel('Number of Predictions')
plt.title('LSTM Overprediction vs Underprediction')
plt.tight_layout()
plt.savefig('visualizations/over_under_prediction.png', dpi=300)
plt.close()

print("\nAll four error analysis graphs saved successfully!")
