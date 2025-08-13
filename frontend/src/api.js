import axios from 'axios';
const API = 'https://rapid-acceleration-partner-blaze.onrender.com';
export default axios.create({ baseURL: API, timeout: 20000 });
