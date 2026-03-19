import axios from 'axios';
import { FEED_URL, authHeader } from './config';

export const getProjects = () => axios.get(`${FEED_URL}/projects`, authHeader());
export const createProject = (data) => axios.post(`${FEED_URL}/projects`, data, authHeader());
export const addCollaborator = (projectId, data) => axios.post(`${FEED_URL}/projects/${projectId}/collaborators`, data, authHeader());
export const uploadDocuments = (projectId, formData) => axios.post(`${FEED_URL}/projects/${projectId}/documents`, formData, { headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' }});
export const updateProject = (id, data) => axios.put(`${FEED_URL}/projects/${id}`, data, authHeader());
export const deleteProject = (id) => axios.delete(`${FEED_URL}/projects/${id}`, authHeader());
