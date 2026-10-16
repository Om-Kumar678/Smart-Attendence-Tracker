import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let authToken = null;
let onUnauthorized = () => {};

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function setApiToken(token) {
  authToken = token || null;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) onUnauthorized();
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.message || error.response?.data?.error || error.message || fallback;
}

export function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ['data', 'items', 'results']) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  throw new Error('Unexpected API response: expected a list or a data/items/results array.');
}
