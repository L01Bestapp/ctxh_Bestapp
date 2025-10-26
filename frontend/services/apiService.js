// src/services/apiService.js
import axios from 'axios';
import API_BASE_URL from '../constants/apiConfig';

// Tạo một instance của axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 giây
});

// Hàm gọi API test
export const getHelloMessage = () => {
  return apiClient.get('/api/test/hello');
};

// Sau này bạn có thể thêm các hàm khác:
// export const loginUser = (email, password) => { ... }
// export const getActivities = () => { ... }