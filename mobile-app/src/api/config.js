import axios from 'axios';
import storage from '../utils/storage';

// Use localhost matching endpoints
export const AUTH_URL = 'https://e20-co528-project-decp-backend.onrender.com/api';
export const FEED_URL = 'https://e20-co528-project-decp-feed-service.onrender.com/api';
export const JOBS_URL = 'https://e20-co528-project-decp-jobs-service.onrender.com/api';
export const EVENTS_URL = 'https://e20-co528-project-decp-events-service.onrender.com/api';


// Create base instances
export const apiAuth = axios.create({ baseURL: AUTH_URL });
export const apiFeed = axios.create({ baseURL: FEED_URL });
export const apiJobs = axios.create({ baseURL: JOBS_URL });
export const apiEvents = axios.create({ baseURL: EVENTS_URL });

// Function to add token interceptor
const addTokenInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(async (config) => {
    const token = await storage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

addTokenInterceptor(apiAuth);
addTokenInterceptor(apiFeed);
addTokenInterceptor(apiJobs);
addTokenInterceptor(apiEvents);
