import api from "./api";

export const taskService = {
  // Lấy toàn bộ danh sách tasks
  getAllTasks: async () => {
    const response = await api.get("/tasks");
    return response.data;
  },

  // Tạo mới một task
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  // Cập nhật task theo ID
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Xóa task theo ID
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
};

export default taskService;
