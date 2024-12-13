import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';

const AuthPage = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.heading}>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h1>
        {/* Pass setUser to Login and Registration */}
        {isLogin ? <Login setUser={setUser} /> : <Registration setUser={setUser} />}
        <p style={styles.toggleText}>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button style={styles.toggleButton} onClick={toggleAuthMode}>
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f3f4f6',
  },
  card: {
    width: '400px',
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333333',
  },
  toggleText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#555555',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    marginLeft: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default AuthPage;
