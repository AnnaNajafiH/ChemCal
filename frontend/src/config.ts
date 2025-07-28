// Create or update this file in your frontend src directory
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL // Use API URL from environment variable (Render will set this)
  : import.meta.env.PROD 
    ? '/api' // In Docker production, we'll proxy requests through Nginx
    : 'http://localhost:8000'; // Local development

export default API_URL;
