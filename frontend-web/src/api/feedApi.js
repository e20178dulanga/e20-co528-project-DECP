import axios from 'axios';
import { FEED_URL, authHeader } from './config';

export const getPosts       = (page = 1) => axios.get(`${FEED_URL}/posts?page=${page}&limit=10`, authHeader());
export const createPost     = (data)     => axios.post(`${FEED_URL}/posts`, data, authHeader());
export const createMediaPost = (formData) =>
  axios.post(`${FEED_URL}/posts/media`, formData, {
    headers: { ...authHeader().headers, 'Content-Type': 'multipart/form-data' },
  });
export const deletePost     = (id)       => axios.delete(`${FEED_URL}/posts/${id}`, authHeader());
export const likePost       = (id)       => axios.post(`${FEED_URL}/posts/${id}/like`, {}, authHeader());
export const sharePost      = (id)       => axios.post(`${FEED_URL}/posts/${id}/share`, {}, authHeader());
export const getComments    = (postId)   => axios.get(`${FEED_URL}/posts/${postId}/comments`, authHeader());
export const addComment     = (postId, data) => axios.post(`${FEED_URL}/posts/${postId}/comments`, data, authHeader());
