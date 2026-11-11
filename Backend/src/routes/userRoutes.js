import express from "express";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from "../controllers/userController.js";
import { protect, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Tất cả các route quản lý tài khoản đều yêu cầu đăng nhập và có quyền Superadmin
router.use(protect);
router.use(authorizeRoles("superadmin"));

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
