// API Configuration
const config = {
  // Base API URL - will use environment variable in production
  API_BASE_URL: (process.env.REACT_APP_API_URL || 'http://localhost:5001').replace(/\/$/, ''),
  
  // WebSocket URL - will use environment variable in production  
  WS_BASE_URL: process.env.REACT_APP_WS_URL || 'ws://localhost:5001',
  
  // Mapbox API Key
  MAPBOX_TOKEN: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
  
  // Environment
  ENV: process.env.REACT_APP_ENV || 'development',
  
  // API Endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      signup: '/api/auth/signup',
      verify: '/api/auth/verify'
    },
    rides: {
      history: '/api/rides/history'
    },
    health: '/api/health'
  }
};

// Export individual values for convenience
export const API_BASE_URL = config.API_BASE_URL;
export const WS_BASE_URL = config.WS_BASE_URL;
export const MAPBOX_TOKEN = config.MAPBOX_TOKEN;
export const ENV = config.ENV;
export const endpoints = config.endpoints;

export default config;