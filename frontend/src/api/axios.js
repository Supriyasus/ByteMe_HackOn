import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000',
  // Remove Content-Type header here - it will be set automatically for FormData
});

export default instance;