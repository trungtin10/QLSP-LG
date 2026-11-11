import mongoose from "mongoose";

export const DEPARTMENTS = [
    "Phòng Thi Lý Thuyết",
    "Phòng Thi Mô Phỏng",
    "Phòng Máy Chủ & Giám Sát",
    "Sân Sát Hạch Sa Hình",
    "Đội Xe Tập Lái Thực Hành",
    "Phòng tuyển sinh",
    "Đào tạo",
    "Kế toán",
    "Đội xe",
];

const productSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Vui lòng nhập mã định danh sản phẩm/thiết bị"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên sản phẩm/thiết bị"],
            trim: true,
        },
        category: {
            type: String,
            default: "Laptop (Máy tính xách tay)",
            trim: true,
        },
        department: {
            type: String,
            required: [true, "Vui lòng chọn hoặc nhập phòng ban / vị trí quản lý"],
            trim: true,
        },
        manager: {
            type: String,
            default: "Ban Quản Lý",
            trim: true,
        },
        managerPhone: {
            type: String,
            default: "",
            trim: true,
        },
        status: {
            type: String,
            default: "Hoạt động",
            trim: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        assignedVehicle: {
            type: String,
            default: "",
            trim: true,
        },
        serialNumber: {
            type: String,
            default: "",
            trim: true,
        },
        warrantyExpiry: {
            type: Date,
        },
        purchaseDate: {
            type: Date,
            default: Date.now,
        },
        maintenanceReason: {
            type: String,
            default: "",
            trim: true,
        },
        location: {
            type: String,
            default: "",
            trim: true,
        },
        specifications: {
            type: String,
            default: "",
            trim: true,
        },
        note: {
            type: String,
            default: "",
            trim: true,
        },
        qrCode: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
