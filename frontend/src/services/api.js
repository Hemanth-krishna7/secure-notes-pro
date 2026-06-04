import axios from 'axios';

/**
 * Axios client configured for SecureNotes Pro backend.
 * Uses withCredentials: true to allow session cookies (Flask-Login compatibility).
 * No JWT token interceptors are configured.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for session-based cookie authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default api;
