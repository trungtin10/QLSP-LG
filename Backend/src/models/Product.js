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
        // Phân rã số lượng theo trạng thái thực tế
        quantityActive: {
            type: Number,
            default: 1,
            min: 0,
        },
        quantityMaintenance: {
            type: Number,
            default: 0,
            min: 0,
        },
        quantityStorage: {
            type: Number,
            default: 0,
            min: 0,
        },
        quantityBroken: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Nhật ký biến động (bảo trì, xuất kho, điều chuyển)
        history: [
            {
                action: { type: String, required: true }, // "maintenance_start", "maintenance_end", "transfer", "update", "created"
                title: { type: String, default: "" },
                quantity: { type: Number, default: 1 },
                fromDepartment: { type: String, default: "" },
                toDepartment: { type: String, default: "" },
                reason: { type: String, default: "" },
                performedBy: { type: String, default: "Hệ thống" },
                createdAt: { type: Date, default: Date.now },
            }
        ],
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

productSchema.pre("save", function () {
    // Nếu tạo mới và chưa set quantityActive thì tự động chia theo status
    if (this.isNew && (this.quantityActive === undefined || this.quantityActive === null)) {
        const qty = Math.max(1, Number(this.quantity) || 1);
        if (this.status === "Đang bảo trì") {
            this.quantityMaintenance = qty;
            this.quantityActive = 0;
        } else if (this.status === "Dự phòng") {
            this.quantityStorage = qty;
            this.quantityActive = 0;
        } else if (this.status === "Hỏng" || this.status === "Thanh lý") {
            this.quantityBroken = qty;
            this.quantityActive = 0;
        } else {
            this.quantityActive = qty;
            this.quantityMaintenance = 0;
        }
    }

    // Đảm bảo quantity luôn bằng tổng các thành phần
    const totalBreakdown = (Number(this.quantityActive) || 0) + 
                           (Number(this.quantityMaintenance) || 0) + 
                           (Number(this.quantityStorage) || 0) + 
                           (Number(this.quantityBroken) || 0);
    if (totalBreakdown > 0) {
        this.quantity = totalBreakdown;
    }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
