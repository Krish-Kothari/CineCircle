import React, { createContext, useState, useContext } from 'react';
import apiClient from '../services/apiClient';
import { saveAuthSession, clearAuthSession } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  async function logout() {
    await clearAuthSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
