import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister } from '../services/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('kashmir_current_user');
      if (storedUser && storedUser !== 'undefined') {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse auth session:', err);
      localStorage.removeItem('kashmir_current_user');
    }
  }, []);

  const login = async (phone, password) => {
    const userData = await apiLogin(phone, password);
    setUser(userData);
    localStorage.setItem('kashmir_current_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, phone, password) => {
    const userData = await apiRegister(name, phone, password);
    setUser(userData);
    localStorage.setItem('kashmir_current_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kashmir_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthModalOpen, setIsAuthModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
