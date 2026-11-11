import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import taskRoute from "./routes/tasksRouters.js";
import authRoute from "./routes/authRoutes.js";
import productRoute from "./routes/productRoutes.js";
import userRoute from "./routes/userRoutes.js";
import departmentRoute from "./routes/departmentRoutes.js";
import categoryRoute from "./routes/categoryRoutes.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const app = express();

// Middleware CORS cho phép Frontend truy cập
app.use(cors());

// Middleware đọc dữ liệu JSON gửi lên từ client (req.body)
app.use(express.json());

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Định tuyến API
app.use("/api/auth", authRoute);
app.use("/api/tasks", taskRoute); 
app.use("/api/products", productRoute);
app.use("/api/users", userRoute);
app.use("/api/departments", departmentRoute);
app.use("/api/categories", categoryRoute);

// Route mặc định kiểm tra server
app.get("/", (req, res) => {
    res.json({ message: "API GPLX Backend is running!" });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
    console.error("Lỗi chưa được xử lý:", err.stack);
    res.status(500).json({ message: "Đã xảy ra lỗi trên máy chủ!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
