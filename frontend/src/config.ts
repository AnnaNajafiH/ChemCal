// Create or update this file in your frontend src directory
const API_URL = import.meta.env.PROD 
  ? '/api' // In production, we'll proxy requests through Nginx
  : 'http://localhost:8000';

export default API_URL;
