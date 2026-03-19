import axios from 'axios';
import { AUTH_URL, authHeader } from './config';

export const getConversations = () => axios.get(`${AUTH_URL}/messages/conversations`, authHeader());
export const getMessages = (userId) => axios.get(`${AUTH_URL}/messages/${userId}`, authHeader());
export const sendMessage = (data) => axios.post(`${AUTH_URL}/messages`, data, authHeader());
