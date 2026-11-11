import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware xác thực JWT token
export const protect = async (req, res, next) => {
    try {
        let token = null;

        // Lấy token từ header Authorization: Bearer <token>
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!",
            });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

        // Tìm người dùng trong DB
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                message: "Tài khoản sở hữu token này không còn tồn tại trên hệ thống!",
            });
        }

        if (currentUser.status === "blocked") {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Superadmin.",
            });
        }

        req.user = currentUser;
        next();
    } catch (error) {
        console.error("Lỗi xác thực JWT:", error.message);
        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn!",
        });
    }
};

// Middleware kiểm tra quyền theo Role (superadmin, admin, user)
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Quyền truy cập bị từ chối! Yêu cầu vai trò: [${roles.join(", ")}]. Bạn đang mang vai trò: ${req.user?.role || "Khách"}`,
            });
        }
        next();
    };
};
