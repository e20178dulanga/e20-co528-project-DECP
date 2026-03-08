import axios from 'axios';
import { JOBS_URL, authHeader } from './config';

export const getJobs         = (params = '') => axios.get(`${JOBS_URL}/jobs?${params}`, authHeader());
export const getJobById      = (id)          => axios.get(`${JOBS_URL}/jobs/${id}`, authHeader());
export const createJob       = (data)        => axios.post(`${JOBS_URL}/jobs`, data, authHeader());
export const applyForJob     = (jobId, data) => axios.post(`${JOBS_URL}/jobs/${jobId}/apply`, data, authHeader());
export const getMyApplications = ()          => axios.get(`${JOBS_URL}/applications/mine`, authHeader());
export const getApplications = (jobId)       => axios.get(`${JOBS_URL}/jobs/${jobId}/applications`, authHeader());
