import axios from 'axios';
import { AUTH_URL, FEED_URL, JOBS_URL, authHeader } from './config';

export const getUserStats = () => axios.get(`${AUTH_URL}/users/stats`, authHeader());
export const getPostStats = () => axios.get(`${FEED_URL}/posts/stats`, authHeader());
export const getJobStats = () => axios.get(`${JOBS_URL}/jobs/stats`, authHeader());
