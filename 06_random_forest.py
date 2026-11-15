
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Load processed datasets
train_data = pd.read_csv('train_processed.csv')
val_data = pd.read_csv('validation_processed.csv')

# Separate features and target
drop_columns = ['engine_id', 'RUL']

X_train = train_data.drop(columns=drop_columns)
y_train = train_data['RUL']

X_val = val_data.drop(columns=drop_columns)
y_val = val_data['RUL']

print("Training Features:", X_train.shape)
print("Validation Features:", X_val.shape)

# Build Random Forest model
model = RandomForestRegressor(
    n_estimators=150,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

# Train the model
print("\nTraining Random Forest Model...")
model.fit(X_train, y_train)

# Make predictions
predictions = model.predict(X_val)

# Evaluate model
mae = mean_absolute_error(y_val, predictions)
rmse = np.sqrt(mean_squared_error(y_val, predictions))
r2 = r2_score(y_val, predictions)

print("\n========== RANDOM FOREST RESULTS ==========")
print(f"MAE  : {mae:.4f}")
print(f"RMSE : {rmse:.4f}")
print(f"R2   : {r2:.4f}")

# Save model
import joblib
joblib.dump(model, 'random_forest_model.pkl')

# Save predictions
results = pd.DataFrame({
    'Actual_RUL': y_val.values,
    'Predicted_RUL': predictions
})

results.to_csv('random_forest_predictions.csv', index=False)

print("\nModel saved as random_forest_model.pkl")
print("Predictions saved as random_forest_predictions.csv")
print("\nRandom Forest Training Completed!")
