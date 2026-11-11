import express from "express";
import {
    getProducts,
    getProductByCode,
    getDepartmentsSummary,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route công khai phục vụ tra cứu tức thì khi quét QR bằng điện thoại
router.get("/scan/:code", getProductByCode);

// Các route quản trị (yêu cầu đăng nhập)
router.get("/", protect, getProducts);
router.get("/departments", protect, getDepartmentsSummary);

// Các quyền can thiệp dữ liệu: dành cho Superadmin (hoặc Admin nếu cần)
router.post("/", protect, authorizeRoles("superadmin", "admin"), createProduct);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("superadmin"), deleteProduct);

export default router;
