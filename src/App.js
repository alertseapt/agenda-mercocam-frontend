import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import StatusBar from './components/StatusBar';
import AdministrativoPage from './pages/AdministrativoPage';
import LeituraPage from './pages/LeituraPage';
import ClientesPage from './pages/ClientesPage';
import './App.css';

const AppContent = () => {
  const { ambiente } = useAuth();
  const [statusBarData, setStatusBarData] = useState({
    selectedItems: [],
    selectedAgendamentos: [],
    onStatusUpdate: null,
    isUpdatingStatus: false,
    onCreateSchedule: null,
    isCreatingSchedule: false
  });

  const updateStatusBarData = (data) => {
    setStatusBarData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="App">
      <Navbar />
      {ambiente === 'administrativo' && (
        <StatusBar 
          selectedItems={statusBarData.selectedItems}
          selectedAgendamentos={statusBarData.selectedAgendamentos}
          onStatusUpdate={statusBarData.onStatusUpdate}
          isUpdatingStatus={statusBarData.isUpdatingStatus}
          onCreateSchedule={statusBarData.onCreateSchedule}
          isCreatingSchedule={statusBarData.isCreatingSchedule}
        />
      )}
      <div className={`content ${ambiente === 'administrativo' ? 'with-statusbar' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/administrativo" replace />} />
          <Route 
            path="/administrativo" 
            element={<AdministrativoPage onUpdateStatusBar={updateStatusBarData} />} 
          />
          <Route path="/leitura" element={<LeituraPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;