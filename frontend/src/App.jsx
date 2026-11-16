import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DashboardOverview from './pages/DashboardOverview';
import PredictionPage from './pages/PredictionPage';
import SensorAnalyticsPage from './pages/SensorAnalyticsPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import ExplainableAIPage from './pages/ExplainableAIPage';
import { api } from './api/client';

export default function App() {
  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const validTabs = ['landing', 'overview', 'prediction', 'sensors', 'comparison', 'xai'];
    return validTabs.includes(hash) ? hash : 'landing';
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  
  // Navigation parameter passing
  const [targetPredictionModel, setTargetPredictionModel] = useState('optimized_lstm');
  const [targetEngineId, setTargetEngineId] = useState(1);

  const setActiveTab = (tabId) => {
    setActiveTabState(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs = ['landing', 'overview', 'prediction', 'sensors', 'comparison', 'xai'];
      if (validTabs.includes(hash)) {
        setActiveTabState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const checkBackendHealth = async () => {
    try {
      await api.checkHealth();
      setBackendStatus('online');
    } catch (err) {
      console.warn("Backend connectivity check failed:", err.message);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigateToPrediction = (modelId = 'optimized_lstm', engineId = 1) => {
    setTargetPredictionModel(modelId);
    setTargetEngineId(Number(engineId));
    setActiveTab('prediction');
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendStatus={backendStatus}
        onRefreshStatus={checkBackendHealth}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'landing' && (
          <LandingPage 
            onGetStarted={setActiveTab} 
            backendStatus={backendStatus} 
          />
        )}

        {activeTab === 'overview' && (
          <DashboardOverview 
            onNavigateToPrediction={handleNavigateToPrediction} 
          />
        )}

        {activeTab === 'prediction' && (
          <PredictionPage 
            initialModel={targetPredictionModel} 
            initialEngineId={targetEngineId} 
          />
        )}

        {activeTab === 'sensors' && (
          <SensorAnalyticsPage 
            initialEngineId={targetEngineId} 
          />
        )}

        {activeTab === 'comparison' && (
          <ModelComparisonPage />
        )}

        {activeTab === 'xai' && (
          <ExplainableAIPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
