import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGGODBCONNECTIONSTRING);
        console.log("Liên kết thành công với MongoDB");
    } catch (error) {
        console.error("Lỗi khi kết nối CSDL:", error);
        process.exit(1); // Đóng server nếu không kết nối được CSDL
    }
};