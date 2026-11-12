import express from "express";
import {
    getProducts,
    getProductByCode,
    getDepartmentsSummary,
    createProduct,
    updateProduct,
    deleteProduct,
    syncAllProductQRCodes,
    handleMaintenanceAction,
    handleTransferAction,
} from "../controllers/productController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route công khai phục vụ tra cứu tức thì khi quét QR bằng điện thoại
router.get("/scan/:code", getProductByCode);

// Các route quản trị (yêu cầu đăng nhập)
router.get("/", protect, getProducts);
router.get("/departments", protect, getDepartmentsSummary);

// Thao tác bảo trì / sửa chữa thiết bị (đưa đi sửa, hoàn tất sửa)
router.post("/:id/maintenance", protect, authorizeRoles("superadmin", "admin"), handleMaintenanceAction);

// Thao tác điều chuyển thiết bị giữa các phòng ban / xuất kho
router.post("/:id/transfer", protect, authorizeRoles("superadmin", "admin"), handleTransferAction);

// Đồng bộ toàn bộ mã QR của sản phẩm theo domain hiện tại
router.post("/sync-qr", protect, authorizeRoles("superadmin", "admin"), syncAllProductQRCodes);

// Các quyền can thiệp dữ liệu: dành cho Superadmin (hoặc Admin nếu cần)
router.post("/", protect, authorizeRoles("superadmin", "admin"), createProduct);
router.put("/:id", protect, authorizeRoles("superadmin", "admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("superadmin"), deleteProduct);

export default router;
