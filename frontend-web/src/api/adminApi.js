import axios from 'axios';
import { AUTH_URL, authHeader } from './config';

export const getPendingUsers = () => axios.get(`${AUTH_URL}/admin/pending`, authHeader());
export const getAllUsersAdmin = () => axios.get(`${AUTH_URL}/admin/users`, authHeader());
export const approveUser = (id) => axios.put(`${AUTH_URL}/admin/approve/${id}`, {}, authHeader());
export const rejectUser = (id) => axios.put(`${AUTH_URL}/admin/reject/${id}`, {}, authHeader());
