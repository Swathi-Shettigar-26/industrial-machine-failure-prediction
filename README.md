\# Industrial Machine Failure Prediction Using Machine Learning-Based Remaining Useful Life Estimation



\## Project Overview



This project focuses on predicting the Remaining Useful Life (RUL) of industrial turbofan engines using machine learning and deep learning techniques.



The objective is to estimate how many operational cycles an engine can continue running before failure, helping support predictive maintenance and reduce unexpected equipment downtime.



The project uses the NASA C-MAPSS FD001 dataset and compares multiple machine learning models, including Random Forest, XGBoost, LSTM, and an optimized LSTM model.



\## Problem Statement



Unexpected industrial equipment failures can cause production downtime, increased maintenance costs, and operational risks.



Traditional maintenance approaches may not accurately identify when equipment is approaching failure.



This project uses historical sensor measurements and machine learning to estimate engine Remaining Useful Life and support condition-based maintenance decisions.



\## Dataset



\*\*Dataset:\*\* NASA C-MAPSS FD001 Turbofan Engine Degradation Dataset



The dataset contains:

\- Training operational data

\- Testing operational data

\- Actual Remaining Useful Life labels for test engines

\- Engine operating settings and sensor measurements



The original raw dataset is not included in this repository. Download the NASA C-MAPSS dataset and place the FD001 files inside `dataset/raw/`.



\## Technologies Used



\- Python

\- NumPy

\- Pandas

\- Scikit-learn

\- XGBoost

\- TensorFlow / Keras

\- Matplotlib

\- Seaborn

\- SHAP

\- Optuna



\## Project Workflow



1\. Data Exploration

2\. Sensor Analysis

3\. Sensor Degradation Visualization

4\. Remaining Useful Life Generation

5\. Feature Engineering

6\. Random Forest Model Development

7\. XGBoost Model Evaluation

8\. LSTM Model Development

9\. Hyperparameter Optimization

10\. Model Evaluation and Error Analysis

11\. Model Explainability using SHAP



\## Machine Learning Models



The following models were developed and evaluated:



\- Random Forest Regressor

\- XGBoost Regressor

\- Long Short-Term Memory (LSTM)

\- Optimized LSTM using Optuna



The optimized LSTM model uses sequential sensor measurements to learn degradation patterns over time.



\## Official Test Results



| Model | MAE | RMSE | RÂ² |

|---|---:|---:|---:|

| Random Forest | 13.3821 | 17.8955 | 0.8145 |

| XGBoost | 13.2552 | 17.6988 | 0.8186 |

| LSTM | 10.5960 | 14.0061 | 0.8864 |

| Optimized LSTM | \*\*9.9228\*\* | \*\*13.9583\*\* | \*\*0.8872\*\* |



The optimized LSTM achieved the best results among the evaluated models on the official FD001 test set.



\## Model Explainability



SHAP (SHapley Additive exPlanations) was used to analyze the contribution of input features to LSTM predictions.



The analysis highlights influential sensor measurements, helping interpret the model's predictions.



\## Project Structure



```text

Industrial\_Machine\_Failure\_Prediction/

â”‚

â”œâ”€â”€ dataset/

â”‚   â””â”€â”€ raw/                 # Original NASA dataset (not uploaded)

â”‚

â”œâ”€â”€ models/                  # Trained model files and configurations

â”‚

â”œâ”€â”€ results/                 # Prediction outputs and evaluation results

â”‚

â”œâ”€â”€ visualizations/          # Model analysis and SHAP visualizations

â”‚

â”œâ”€â”€ reports/                 # Project reports

â”‚

â”œâ”€â”€ 01\_data\_exploration.py

â”œâ”€â”€ 02\_sensor\_analysis.py

â”œâ”€â”€ 03\_sensor\_visualization.py

â”œâ”€â”€ 04\_rul\_generation.py

â”œâ”€â”€ 05\_feature\_engineering.py

â”œâ”€â”€ 06\_random\_forest.py

â”œâ”€â”€ 09\_error\_analysis.py

â”œâ”€â”€ 10\_model\_explainability.py

â”‚

â”œâ”€â”€ random\_forest\_model.pkl

â”œâ”€â”€ train\_processed.csv

â”œâ”€â”€ train\_with\_RUL.csv

â”œâ”€â”€ validation\_processed.csv

â”‚

â”œâ”€â”€ requirements.txt

â””â”€â”€ .gitignore

```



\## Installation and Setup



\### 1. Clone the repository



```bash

git clone https://github.com/YOUR\_USERNAME/industrial-machine-failure-prediction.git

cd industrial-machine-failure-prediction

```



\### 2. Create a virtual environment



```bash

python -m venv .venv

```



\### 3. Activate the environment



Windows:



```bash

.venv\\Scripts\\activate

```



\### 4. Install dependencies



```bash

pip install -r requirements.txt

```



TensorFlow and other deep learning dependencies may require a compatible Python and operating-system environment. Google Colab or a compatible Linux/WSL environment can be used for model training and evaluation.



\### 5. Add the dataset



Download the NASA C-MAPSS dataset and place the FD001 files in:



```text

dataset/raw/

```



\## Future Enhancements



\- Streamlit-based interactive prediction dashboard

\- Real-time sensor data monitoring

\- Predictive maintenance alerts

\- Deployment as a web application



\## Project Objective



To demonstrate how machine learning and deep learning can be applied to industrial predictive maintenance through Remaining Useful Life estimation.



\## Acknowledgement



Dataset: NASA Commercial Modular Aero-Propulsion System Simulation (C-MAPSS).
