import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigateToBuildDeck = () => {
    navigate(`/buildDeck/${user.id}`);
  };

  const handleNavigateToRoomSystem = () => {
    navigate('/roomNavigation');
  };

  return (
    <div style={styles.container}>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <div style={styles.buttonContainer}>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
        <button onClick={handleNavigateToBuildDeck} style={styles.buildDeckButton}>
          Build Your Deck
        </button>
        <button onClick={handleNavigateToRoomSystem} style={styles.roomSystemButton}>
          Room System
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  buttonContainer: {
    marginTop: '20px',
  },
  logoutButton: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  buildDeckButton: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  roomSystemButton: {
    margin: '5px',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Dashboard;
