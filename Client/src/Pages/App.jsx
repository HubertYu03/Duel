import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import Dashboard from './Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
