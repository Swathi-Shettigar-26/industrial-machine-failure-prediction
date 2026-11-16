import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // System Health & Catalog
  checkHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },
  getModels: async () => {
    const res = await apiClient.get('/api/models');
    return res.data;
  },

  // Engines & Trajectory
  getEngines: async () => {
    const res = await apiClient.get('/api/engines');
    return res.data;
  },
  getEngineTrajectory: async (engineId) => {
    const res = await apiClient.get(`/api/engines/${engineId}/trajectory`);
    return res.data;
  },

  // Prediction Engine
  predict: async (payload) => {
    const res = await apiClient.post('/api/predict', payload);
    return res.data;
  },

  // Analytics & Metrics
  getBenchmarks: async () => {
    const res = await apiClient.get('/api/analytics/benchmarks');
    return res.data;
  },
  getFeatureImportance: async () => {
    const res = await apiClient.get('/api/analytics/feature-importance');
    return res.data;
  },
  getTrainingHistory: async () => {
    const res = await apiClient.get('/api/analytics/training-history');
    return res.data;
  },

  // Explainability & SHAP
  getShap: async () => {
    const res = await apiClient.get('/api/explainability/shap');
    return res.data;
  },
};
