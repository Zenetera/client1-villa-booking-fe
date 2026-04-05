import { api } from './client';

interface LoginResponse {
  data: { token: string };
}

export async function loginApi(username: string, password: string): Promise<string> {
  const res = await api<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return res.data.token;
}
