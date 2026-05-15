import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // URL của Node.js server
});

// Tự động thêm Token vào Header nếu có trong localStorage
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;