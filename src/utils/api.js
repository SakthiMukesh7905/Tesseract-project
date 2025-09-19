import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // 👈 adjust to match backend
});

// 🔑 Automatically attach token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
