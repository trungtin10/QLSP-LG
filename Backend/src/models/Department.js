import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Vui lòng nhập tên phòng ban / vị trí"],
            unique: true,
            trim: true,
        },
        code: {
            type: String,
            default: "",
            uppercase: true,
            trim: true,
        },
        area: {
            type: String,
            default: "Nhà Điều Hành",
            trim: true,
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
