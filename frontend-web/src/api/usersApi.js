import axios from 'axios';
import { AUTH_URL, authHeader } from './config';

export const searchUsers = (query) => axios.get(`${AUTH_URL}/users/search?q=${query}`, authHeader());
