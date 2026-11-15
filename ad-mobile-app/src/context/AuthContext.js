import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../services/apiClient';
import { saveAuthSession, clearAuthSession, getAuthToken, getStoredUser } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([getAuthToken(), getStoredUser()])
      .then(([token, storedUser]) => {
        if (active && token && storedUser) setUser(storedUser);
      })
      .catch(() => {
        if (active) setError('Unable to restore the saved CineCircle session');
      });
    return () => {
      active = false;
    };
  }, []);

  async function login(emailOrUsername, password) {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/tracker/auth/login', {
        emailOrUsername,
        password
      });
      const { user: loggedInUser, token } = response.data.data;
      await saveAuthSession(token, loggedInUser);
      setUser(loggedInUser);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to CineCircle server');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function register(name, username, email, password) {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post('/tracker/auth/register', {
        name,
        username,
        email,
        password
      });
      const { user: registeredUser, token } = response.data.data;
      await saveAuthSession(token, registeredUser);
      setUser(registeredUser);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create your CineCircle account');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await clearAuthSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
