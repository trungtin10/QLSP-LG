import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Hàm sinh JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role,
            fullName: user.fullName,
        },
        process.env.JWT_SECRET || "fallback_secret",
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        }
    );
};

// Đăng nhập hệ thống (POST /api/auth/login)
export const login = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const loginIdentifier = (username || email || "").toLowerCase().trim();

        // Kiểm tra dữ liệu đầu vào
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập tên đăng nhập và mật khẩu!",
            });
        }

        // Tìm user theo username hoặc email
        let user = await User.findOne({
            $or: [
                { username: loginIdentifier },
                { email: loginIdentifier }
            ]
        }).select("+password");

        // Nếu chưa có tài khoản, tự động nạp tài khoản mẫu ngay
        if (!user) {
            await autoSeedAdmin();
            user = await User.findOne({
                $or: [
                    { username: loginIdentifier },
                    { email: loginIdentifier }
                ]
            }).select("+password");
        }

        if (!user) {
            return res.status(401).json({
                message: "Tên đăng nhập hoặc mật khẩu không chính xác!",
            });
        }

        // So khớp mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Tên đăng nhập hoặc mật khẩu không chính xác!",
            });
        }

        // Kiểm tra trạng thái hoạt động
        if (user.status === "blocked") {
            return res.status(403).json({
                message: "Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Superadmin.",
            });
        }

        // Cập nhật thời điểm đăng nhập gần nhất
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Tạo JWT Token
        const token = generateToken(user);

        // Trả về thông tin an toàn (bỏ password)
        res.status(200).json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                lastLogin: new Date(),
            },
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập!" });
    }
};

// Lấy thông tin tài khoản hiện tại (GET /api/auth/me)
export const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        console.error("Lỗi lấy thông tin cá nhân:", error);
        res.status(500).json({ message: "Lỗi máy chủ!" });
    }
};

// Khởi tạo các tài khoản mẫu với username chuẩn (không cần @)
export const autoSeedAdmin = async () => {
    try {
        const seedUsers = [
            {
                fullName: "Hệ Thống Superadmin",
                username: "superadmin",
                email: "superadmin@gplx.vn",
                password: "SuperAdmin@123",
                role: "superadmin",
            },
            {
                fullName: "Quản Trị Viên GPLX",
                username: "admin",
                email: "admin@gplx.vn",
                password: "Admin@123",
                role: "admin",
            },
            {
                fullName: "Học Viên Mẫu",
                username: "user",
                email: "user@gplx.vn",
                password: "User@123",
                role: "user",
            },
        ];

        for (const account of seedUsers) {
            let existing = await User.findOne({
                $or: [{ username: account.username }, { email: account.email }]
            }).select("+password");

            if (!existing) {
                await User.create(account);
                console.log(`[AutoSeed] Đã tạo mới tài khoản: ${account.username} (${account.role})`);
            } else {
                existing.username = account.username;
                existing.password = account.password;
                existing.role = account.role;
                await existing.save();
                console.log(`[AutoSeed] Đã cập nhật mật khẩu & username cho: ${account.username}`);
            }
        }
    } catch (err) {
        console.error("[AutoSeed] Lỗi khi tạo tài khoản mẫu:", err.message);
    }
};

// API kích hoạt seed tài khoản qua HTTP (POST /api/auth/seed)
export const seedAccounts = async (req, res) => {
    try {
        await autoSeedAdmin();
        res.status(200).json({
            message: "Khởi tạo và đồng bộ tài khoản mẫu thành công!",
            accounts: [
                { role: "superadmin", username: "superadmin", pass: "SuperAdmin@123" },
                { role: "admin", username: "admin", pass: "Admin@123" },
                { role: "user", username: "user", pass: "User@123" },
            ],
        });
    } catch (error) {
        console.error("Lỗi seed tài khoản:", error);
        res.status(500).json({ message: "Lỗi khởi tạo tài khoản mẫu!" });
    }
};
