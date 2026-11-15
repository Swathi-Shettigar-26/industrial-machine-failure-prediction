
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import os

# Create output directory
os.makedirs('visualizations', exist_ok=True)

# Load trained models
rf_model = joblib.load('models/random_forest_model.pkl')

from xgboost import XGBRegressor

xgb_model = XGBRegressor()
xgb_model.load_model('models/xgboost_model.json')

# Load feature names
train_data = pd.read_csv('train_processed.csv')

feature_columns = [
    col for col in train_data.columns
    if col not in ['engine_id', 'RUL']
]

# Extract feature importance
rf_importance = rf_model.feature_importances_
xgb_importance = xgb_model.feature_importances_

# Create comparison dataframe
importance_df = pd.DataFrame({
    'Feature': feature_columns,
    'Random_Forest': rf_importance,
    'XGBoost': xgb_importance
})

importance_df = importance_df.sort_values(
    'XGBoost',
    ascending=False
)

print("\n========== FEATURE IMPORTANCE ==========")
print(importance_df.to_string(index=False))

# Save feature importance
importance_df.to_csv(
    'results/feature_importance_comparison.csv',
    index=False
)

# Plot comparison
importance_df.set_index('Feature').plot(
    kind='bar',
    figsize=(14, 6),
    width=0.8
)

plt.title('Random Forest vs XGBoost Feature Importance')
plt.xlabel('Features')
plt.ylabel('Importance')
plt.xticks(rotation=45)
plt.tight_layout()

plt.savefig(
    'visualizations/feature_importance_comparison.png',
    dpi=300
)

plt.show()

print("\nFeature importance analysis completed!")
