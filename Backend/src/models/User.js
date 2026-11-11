import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Vui lòng nhập họ và tên"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Vui lòng nhập tên đăng nhập"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
            default: "",
        },
        password: {
            type: String,
            required: [true, "Vui lòng nhập mật khẩu"],
            minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự"],
            select: false, // Mặc định không trả về password khi query
        },
        role: {
            type: String,
            enum: ["superadmin", "admin", "user"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        },
        avatar: {
            type: String,
            default: "",
        },
        lastLogin: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Tự động hash mật khẩu trước khi lưu vào MongoDB (Chuẩn Mongoose Async Promise)
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Hàm so khớp mật khẩu người dùng nhập vào
userSchema.methods.comparePassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
