import api from "./api";

export const productService = {
  // Lấy danh sách sản phẩm (hỗ trợ search, department, status, page, limit)
  getProducts: async (params = {}) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Tra cứu sản phẩm bằng Mã định danh ID (quét QR công khai)
  getProductByCode: async (code) => {
    const response = await api.get(`/products/scan/${encodeURIComponent(code)}`);
    return response.data;
  },

  // Đồng bộ / Làm mới mã QR của toàn bộ thiết bị theo domain hiện tại
  syncQRCodes: async () => {
    const response = await api.post("/products/sync-qr");
    return response.data;
  },

  // ================= PHÒNG BAN & VỊ TRÍ CRUD =================
  getDepartments: async () => {
    const response = await api.get("/departments");
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await api.post("/departments", data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // ================= LOẠI THIẾT BỊ CRUD =================
  getCategories: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  createCategory: async (data) => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  // Tạo mới sản phẩm & mã QR
  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Cập nhật thông tin sản phẩm
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Xóa sản phẩm
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
