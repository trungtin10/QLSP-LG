import api from "./api";

export const userService = {
  // Lấy danh sách toàn bộ người dùng từ MongoDB
  getUsers: async (params = {}) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Tạo người dùng mới
  createUser: async (userData) => {
    const response = await api.post("/users", userData);
    return response.data;
  },

  // Cập nhật thông tin người dùng trực tiếp trên MongoDB (Họ tên, username, role, status, password)
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Xóa vĩnh viễn người dùng khỏi MongoDB
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
