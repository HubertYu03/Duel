import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './Pages/AuthPage';
import Dashboard from './Pages/Dashboard';
import BuildDeck from './Pages/BuildDeck';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userID = localStorage.getItem('userID');
    const email = localStorage.getItem('email');
    const username = localStorage.getItem('username');

    if (userID && email && username) {
      setUser({ id: userID, email, username });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear all user data from localStorage
    setUser(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <AuthPage setUser={setUser} />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/" />}
      />
      <Route
        path="/buildDeck/:userID"
        element={user ? <BuildDeck /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;
