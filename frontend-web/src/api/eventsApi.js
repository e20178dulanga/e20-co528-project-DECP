import axios from 'axios';
import { EVENTS_URL, authHeader } from './config';

export const getEvents       = (params = '') => axios.get(`${EVENTS_URL}/events?${params}`, authHeader());
export const getEventById    = (id)          => axios.get(`${EVENTS_URL}/events/${id}`, authHeader());
export const createEvent     = (data)        => axios.post(`${EVENTS_URL}/events`, data, authHeader());
export const rsvpEvent       = (id)          => axios.post(`${EVENTS_URL}/events/${id}/rsvp`, {}, authHeader());
export const cancelRsvp      = (id)          => axios.delete(`${EVENTS_URL}/events/${id}/rsvp`, authHeader());
export const getMyRsvps      = ()            => axios.get(`${EVENTS_URL}/rsvps/mine`, authHeader());
export const getNotifications = ()           => axios.get(`${EVENTS_URL}/notifications`, authHeader());
export const markAllRead     = ()            => axios.patch(`${EVENTS_URL}/notifications/read-all`, {}, authHeader());
