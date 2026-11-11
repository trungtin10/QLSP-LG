import api from "./api";

export const authService = {
  // Đăng nhập bằng tên đăng nhập (username) hoặc email
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  // Lấy thông tin user hiện tại
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Khởi tạo các tài khoản mẫu ban đầu (Superadmin, Admin, User)
  seedAccounts: async () => {
    const response = await api.post("/auth/seed");
    return response.data;
  },
};

export default authService;
