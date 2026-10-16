import { api } from './api.js';
import { endpoints } from './endpoints.js';
import { demoUsers } from './mockData.js';

export const MOCK_MODE = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export async function login({ identifier, password, role }) {
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!identifier.trim() || password.length < 6) throw new Error('Enter a valid email and a password of at least 6 characters.');
    return { token: `demo-${role}-session`, user: { ...demoUsers[role], email: identifier.trim() } };
  }
  const { data } = await api.post(endpoints.auth.login, { email: identifier, password });
  const user = data?.user || data?.data?.user;
  const token = data?.token || data?.accessToken || data?.data?.token;
  if (!user || !token || !user.role) throw new Error('The login response must include a user with a role and an access token.');
  return { token, user: { ...user, role: String(user.role).toLowerCase() } };
}

export async function fetchCurrentUser() {
  if (MOCK_MODE) return null;
  const { data } = await api.get(endpoints.auth.me);
  return data?.user || data?.data?.user || data;
}

export async function updateStudentProfile(payload) {
  if (MOCK_MODE) return { ...payload };
  const { data } = await api.put(endpoints.studentProfile, payload);
  return data?.user || data?.data?.user || data;
}

export async function changePassword(payload) {
  if (MOCK_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return;
  }
  await api.put(endpoints.auth.changePassword, payload);
}
