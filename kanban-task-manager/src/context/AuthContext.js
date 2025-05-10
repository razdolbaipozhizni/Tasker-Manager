import React, { createContext, useState, useEffect } from 'react';
import api, { setAuthToken } from '../api';  // обратите внимание на ../api

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // При старте проверяем токен и подтягиваем профиль
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => setAuthToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Логин
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.token);
    setUser(data.user);
  };

  // Регистрация
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setAuthToken(data.token);
    setUser(data.user);
  };

  // Выход
  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // Пока идёт проверка токена — не рендерим детей
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
