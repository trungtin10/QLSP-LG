import express from "express";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Lấy danh sách phòng ban (công khai phục vụ bộ lọc tìm kiếm và tra cứu)
router.get("/", getDepartments);

// Quyền thêm/sửa/xoá phòng ban
router.post("/", protect, authorizeRoles("superadmin", "admin"), createDepartment);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateDepartment);
router.delete("/:id", protect, authorizeRoles("superadmin", "admin"), deleteDepartment);

export default router;
