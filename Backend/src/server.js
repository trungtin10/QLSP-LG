import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import { connectDB } from "./config/db.js";
import taskRoute from "./routes/tasksRouters.js";
import authRoute from "./routes/authRoutes.js";
import productRoute from "./routes/productRoutes.js";
import userRoute from "./routes/userRoutes.js";
import departmentRoute from "./routes/departmentRoutes.js";
import categoryRoute from "./routes/categoryRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.dirname(__filename);

// Tự động nạp file .env từ Backend/.env hoặc thư mục gốc
const backendEnvPath = path.resolve(currentDir, "../.env");
if (fs.existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
} else {
    dotenv.config();
}
// Đường dẫn tuyệt đối đến thư mục Frontend/dist
const frontendDistPath = path.resolve(currentDir, "../../Frontend/dist");

const PORT = process.env.PORT || 5001;
const app = express();

// Cho phép Express tin cậy reverse proxy của Render để lấy đúng https và domain
app.set("trust proxy", 1);

// Cho phép CORS khi chạy dev frontend riêng (port 5173) hoặc từ mọi origin
app.use(cors({
    origin: true,
    credentials: true,
}));

// Middleware đọc dữ liệu JSON gửi lên từ client (req.body)
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// ================= CÁC API ENDPOINTS =================
app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute); 
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/departments", departmentRoute);
app.use("/api/categories", categoryRoute);

// Endpoint kiểm tra trạng thái API
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "API GPLX Backend is running!" });
});

// ================= PHỤC VỤ FRONTEND CHẠY CHUNG MỘT PORT =================
if (fs.existsSync(frontendDistPath)) {
    console.log(`[Production] Phục vụ Frontend tĩnh từ: ${frontendDistPath}`);
    app.use(express.static(frontendDistPath));

    // Mọi route client không phải /api thì trả về index.html (SPA routing cho React Router)
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
            return next();
        }
        res.sendFile(path.join(frontendDistPath, "index.html"));
    });
} else {
    console.warn(`[Warning] Thư mục Frontend/dist chưa được tạo. Hãy chạy 'npm run build' trong Frontend.`);
    app.get("/", (req, res) => {
        res.json({
            message: "API GPLX Backend is running!",
            note: "Frontend build không tìm thấy tại Frontend/dist. Vui lòng chạy 'npm run build' để đóng gói giao diện."
        });
    });
}

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error("Lỗi chưa được xử lý:", err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi trên máy chủ!" });
});

app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 GPLX System đang chạy tại: http://localhost:${PORT}`);
    console.log(`📦 Chế độ: ${fs.existsSync(frontendDistPath) ? "Chung 1 môi trường (Frontend + Backend)" : "Chỉ Backend API"}`);
    console.log(`=================================================`);
});
