import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigateToBuildDeck = () => {
    //Put in Build Deck Stuff I wont Touch This
  };

  return (
    <div style={styles.container}>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <button onClick={onLogout} style={styles.logoutButton}>
        Logout
      </button>
      <button onClick={handleNavigateToBuildDeck} style={styles.buildDeckButton}>
        Build Your Deck
      </button>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    marginTop: '50px',
  },
  logoutButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginRight: '10px',
  },
  buildDeckButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Dashboard;
