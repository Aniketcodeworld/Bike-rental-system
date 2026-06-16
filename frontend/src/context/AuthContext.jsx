import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bikeRentalUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bikeRentalToken') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/profile');
        setUser(data.data);
        localStorage.setItem('bikeRentalUser', JSON.stringify(data.data));
      } catch {
        setUser(null);
        setToken('');
        localStorage.removeItem('bikeRentalToken');
        localStorage.removeItem('bikeRentalUser');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.data);
    setToken(data.token);
    localStorage.setItem('bikeRentalToken', data.token);
    localStorage.setItem('bikeRentalUser', JSON.stringify(data.data));
    return data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.data);
    setToken(data.token);
    localStorage.setItem('bikeRentalToken', data.token);
    localStorage.setItem('bikeRentalUser', JSON.stringify(data.data));
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout failure
    }
    setUser(null);
    setToken('');
    localStorage.removeItem('bikeRentalToken');
    localStorage.removeItem('bikeRentalUser');
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/profile');
    setUser(data.data);
    localStorage.setItem('bikeRentalUser', JSON.stringify(data.data));
    return data.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);