import express from "express";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy danh sách phòng ban (yêu cầu đăng nhập hoặc có thể xem được)
router.get("/", protect, getDepartments);

// Quyền thêm/sửa/xoá phòng ban
router.post("/", protect, authorizeRoles("superadmin", "admin"), createDepartment);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateDepartment);
router.delete("/:id", protect, authorizeRoles("superadmin", "admin"), deleteDepartment);

export default router;
