// This file configures the API URL for different environments
const API_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL // Use API URL from environment variable (set in Netlify)
  : import.meta.env.PROD 
    ? 'https://molar-mass-calculator-api.onrender.com' // Default production Render URL if not overridden
    : 'http://localhost:8000'; // Local development

export default API_URL;
