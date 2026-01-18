import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401s (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string) => api.post('/auth/register', { email, password }),
};

export const projectsAPI = {
  list: () => api.get('/projects'),
  create: (data: { name: string; description?: string; prompts?: string[] }) => api.post('/projects', data),
  get: (id: string) => api.get(`/projects/${id}`),
  update: (id: string, data: { prompts: string[] }) => api.put(`/projects/${id}`, data),
};

export const chatAPI = {
  send: (projectId: string, message: string) => api.post(`/chat/${projectId}`, { message }),
  history: (projectId: string) => api.get(`/chat/${projectId}/history`),
  sendStream: (projectId: string, message: string) =>
    fetch(`${import.meta.env.VITE_API_URL}/chat/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify({ message }),
    }).then((res) => {
      if (!res.ok) throw new Error("Chat failed");
      return res;
    }),
};