// src/api.js
import axios from 'axios';

// Use environment variable if set, otherwise fallback to Render backend
const API = import.meta.env.VITE_API_URL || 'https://rapid-acceleration-partner-blaze.onrender.com';

const instance = axios.create({
  baseURL: API,
  timeout: 20000,
});

export default instance;
