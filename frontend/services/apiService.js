// src/services/apiService.js
import axios from 'axios';
import { Config } from '@/constants/Config';

// Create axios instance
const apiClient = axios.create({
  baseURL: Config.API_BASE_URL,
  timeout: 10000, // 10 seconds
});

// Test API call
export const getHelloMessage = () => {
  return apiClient.get('/test/hello'); // Assuming /api/v1 is in base URL
};
