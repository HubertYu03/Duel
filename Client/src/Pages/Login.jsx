import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Step 1: Log in the user
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      const userID = loginData.user?.id;
      if (!userID) throw new Error('User ID not found.');

      // Step 2: Fetch user data from the 'Users' table
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('username, email')
        .eq('userID', userID)
        .single();
      if (userError) throw userError;

      // Step 3: Store user data in localStorage
      localStorage.setItem('userID', userID);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('username', userData.username);

      // Step 4: Update the global state and navigate to dashboard
      setUser({ id: userID, email: userData.email, username: userData.username });
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'An unknown error occurred.');
      console.error('Login error:', error);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      {error && <p style={styles.error}>{error}</p>}
      <button onClick={handleLogin} style={styles.button}>
        Login
      </button>
    </div>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '12px 15px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    margin: '10px 0',
  },
};

export default Login;
