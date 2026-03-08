import axios from 'axios';
import { AUTH_URL } from './config';

export const register = (data) => axios.post(`${AUTH_URL}/auth/register`, data);
export const login    = (data) => axios.post(`${AUTH_URL}/auth/login`, data);

export const getProfile   = (token) =>
  axios.get(`${AUTH_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } });

export const updateProfile = (token, data) =>
  axios.put(`${AUTH_URL}/users/me`, data, { headers: { Authorization: `Bearer ${token}` } });
