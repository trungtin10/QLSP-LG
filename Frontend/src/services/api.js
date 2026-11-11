import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request Interceptor: Tự động đính kèm JWT Token vào Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gplx_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt lỗi phản hồi chung & xử lý 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Nếu token hết hạn hoặc không hợp lệ ở các route admin
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        localStorage.removeItem("gplx_token");
        localStorage.removeItem("gplx_user");
        window.location.href = "/admin/login";
      }
    }
    const message = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi kết nối máy chủ";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
