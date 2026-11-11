import bcrypt from "bcryptjs";
import User from "../models/User.js";

// Lấy danh sách toàn bộ người dùng (có tìm kiếm, lọc theo vai trò, trạng thái)
export const getUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const query = {};

        // Lọc theo vai trò (superadmin, admin, user)
        if (role && role !== "all") {
            query.role = role;
        }

        // Lọc theo trạng thái
        if (status && status !== "all") {
            query.status = status;
        }

        // Tìm kiếm theo Họ tên, Username, Email
        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            query.$or = [{ fullName: regex }, { username: regex }, { email: regex }];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: users.length,
            users,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách người dùng!" });
    }
};

// Tạo người dùng mới trực tiếp vào MongoDB
export const createUser = async (req, res) => {
    try {
        const { fullName, username, password, email, role, status } = req.body;

        if (!fullName || !username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ: Họ tên, Tên đăng nhập và Mật khẩu!",
            });
        }

        const normalizedUsername = username.toLowerCase().trim();

        // Kiểm tra username đã tồn tại chưa
        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) {
            return res.status(400).json({
                message: `Tên đăng nhập '${normalizedUsername}' đã có người sử dụng!`,
            });
        }

        const newUser = new User({
            fullName: fullName.trim(),
            username: normalizedUsername,
            password,
            email: email ? email.toLowerCase().trim() : "",
            role: role || "user",
            status: status || "active",
        });

        await newUser.save();

        res.status(201).json({
            message: `Tạo người dùng [${newUser.username}] thành công!`,
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                createdAt: newUser.createdAt,
            },
        });
    } catch (error) {
        console.error("Lỗi tạo người dùng:", error);
        res.status(500).json({ message: "Lỗi khi tạo người dùng mới!" });
    }
};

// Cập nhật thông tin người dùng trực tiếp trên MongoDB (Họ tên, username, role, status, password)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, username, password, email, role, status } = req.body;

        const user = await User.findById(id).select("+password");
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng trong cơ sở dữ liệu!" });
        }

        // Nếu thay đổi username, kiểm tra trùng lặp
        if (username && username.toLowerCase().trim() !== user.username) {
            const normalizedUsername = username.toLowerCase().trim();
            const exists = await User.findOne({ username: normalizedUsername });
            if (exists) {
                return res.status(400).json({
                    message: `Tên đăng nhập '${normalizedUsername}' đã được sử dụng!`,
                });
            }
            user.username = normalizedUsername;
        }

        if (fullName) user.fullName = fullName.trim();
        if (email !== undefined) user.email = email.toLowerCase().trim();
        if (role) user.role = role;
        if (status) user.status = status;

        // Nếu có cập nhật mật khẩu mới -> gán lại để hook pre('save') hash tự động
        if (password && password.trim() !== "") {
            if (password.length < 6) {
                return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự!" });
            }
            user.password = password;
        }

        await user.save();

        res.status(200).json({
            message: `Đã cập nhật thông tin người dùng [${user.username}] trên MongoDB thành công!`,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                lastLogin: user.lastLogin,
                updatedAt: user.updatedAt,
            },
        });
    } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật thông tin người dùng!" });
    }
};

// Xóa người dùng khỏi MongoDB
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Chặn người dùng tự xoá chính mình
        if (req.user._id.toString() === id) {
            return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình!" });
        }

        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Không tìm thấy người dùng cần xoá!" });
        }

        res.status(200).json({
            message: `Đã xoá vĩnh viễn tài khoản [${deleted.username}] khỏi cơ sở dữ liệu!`,
        });
    } catch (error) {
        console.error("Lỗi xoá người dùng:", error);
        res.status(500).json({ message: "Lỗi khi xoá người dùng!" });
    }
};
