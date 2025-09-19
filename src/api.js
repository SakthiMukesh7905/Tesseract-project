// src/api.js
import axios from "axios";


const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add JWT token to headers if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token may be invalid or expired
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
    }
    return Promise.reject(error);
  }
);

export default api;
