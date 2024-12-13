import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Registration = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      setError('All fields are required.');
      return;
    }

    try {
      // Register the user and save the username in `user_metadata`
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username, // Save username in `user_metadata`
          },
        },
      });

      if (error) throw error;
      alert('Registration successful! You can now log in.');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
    <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
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
      <button onClick={handleRegister} style={styles.button}>
        Sign Up
      </button>
    </div>
  );
};

const styles = {
  input: {
    width: '100%',
    padding: '10px',
    margin: '10px 0',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#28a745',
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

export default Registration;
