const API_BASE = "https://flash-card-study-app-backend.onrender.com";

export async function request(path, options = {}) {
  const token = localStorage.getItem('recall-token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

export const send = (method, body) => ({ method, body: JSON.stringify(body) });
