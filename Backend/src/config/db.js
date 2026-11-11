import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGGODBCONNECTIONSTRING;
        if (!uri) {
            console.error("Lỗi: Chưa cấu hình biến môi trường MONGODB_URI hoặc MONGGODBCONNECTIONSTRING!");
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log("Liên kết thành công với MongoDB");
    } catch (error) {
        console.error("Lỗi khi kết nối CSDL:", error.message || error);
        process.exit(1); // Đóng server nếu không kết nối được CSDL
    }
};
