import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./Pages/AuthPage";
import Dashboard from "./Pages/Dashboard";
import BuildDeck from "./Pages/BuildDeck";
import RoomNavigation from "./Pages/RoomNavigation";
import RoomPage from "./Pages/RoomPage";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");

    if (userID && email && username) {
      setUser({ id: userID, email, username });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Clear local storage on logout
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
      <Route
        path="/roomNavigation"
        element={user ? <RoomNavigation /> : <Navigate to="/" />}
      />
      <Route
        path="/room/:roomID"
        element={user ? <RoomPage /> : <Navigate to="/" />}
      />
    </Routes>
  );
};

export default App;
