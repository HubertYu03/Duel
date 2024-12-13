import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Registration = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Add this state

  const handleRegister = async () => {
    if (!email || !username || !password) {
      setError('All fields are required.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Step 1: Register the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }, // Optional metadata
        },
      });
  
      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
  
      const userID = authData.user?.id; // Extract the UUID from the auth system
      if (!userID) throw new Error('User ID not found after signup.');
  
      // Step 2: Insert user into 'Users' table
      const { error: insertError } = await supabase
        .from('Users')
        .insert({
          userID: userID, // Insert the UUID into the new column
          email,
          username,
        });
  
      if (insertError) {
        console.error('Database insert error:', insertError);
        throw insertError;
      }
  
      alert('Registration successful! You can now log in.');
    } catch (error) {
      console.error('Registration error:', error.message || error);
      setError(error.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
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
      <button onClick={handleRegister} style={styles.button} disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Sign Up'}
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
