import express from "express";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy danh mục loại thiết bị (công khai phục vụ bộ lọc tìm kiếm và tra cứu)
router.get("/", getCategories);

// Quyền thêm/sửa/xoá loại thiết bị
router.post("/", protect, authorizeRoles("superadmin", "admin"), createCategory);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("superadmin", "admin"), deleteCategory);

export default router;
