import Category from "../models/Category.js";
import Product from "../models/Product.js";

const DEFAULT_CATEGORIES_SEED = [
    { name: "Laptop (Máy tính xách tay)", code: "LAPTOP", description: "Máy tính xách tay phục vụ chấm thi, văn phòng" },
    { name: "Máy tính để bàn (PC)", code: "PC", description: "Máy trạm phòng thi lý thuyết, mô phỏng và phòng làm việc" },
    { name: "Thiết bị DAT (Giám sát hành trình)", code: "DAT", description: "Thiết bị giám sát thời gian và quãng đường học thực hành" },
    { name: "Cabin tập lái mô phỏng", code: "CABIN", description: "Hệ thống cabin mô phỏng lái xe điện tử" },
    { name: "Màn hình máy tính", code: "MONITOR", description: "Màn hình giám sát và hiển thị kết quả" },
    { name: "Máy chủ Server & Lưu trữ", code: "SERVER", description: "Máy chủ cơ sở dữ liệu và hệ thống lưu trữ camera" },
    { name: "Thiết bị mạng (Switch / Router / Wifi)", code: "NETWORK", description: "Hạ tầng mạng nội bộ và đường truyền dữ liệu" },
    { name: "Máy in / Máy quét (Scanner)", code: "PRINTER", description: "Thiết bị in ấn chứng chỉ, hồ sơ và scan tài liệu" },
    { name: "Camera giám sát", code: "CAMERA", description: "Camera quan sát phòng thi, cabin và sân sát hạch" },
    { name: "Xe sát hạch / Xe tập lái", code: "VEHICLE", description: "Phương tiện gắn cảm biến chấm điểm tự động" },
    { name: "Khác", code: "OTHER", description: "Thiết bị phụ trợ khác" },
];

// Lấy danh sách tất cả loại thiết bị kèm số lượng thiết bị thực tế
export const getCategories = async (req, res) => {
    try {
        let categories = await Category.find().sort({ createdAt: 1 });

        // Tự động khởi tạo dữ liệu mẫu nếu chưa có
        if (categories.length === 0) {
            await Category.insertMany(DEFAULT_CATEGORIES_SEED);
            categories = await Category.find().sort({ createdAt: 1 });
        }

        // Đếm số lượng thiết bị thuộc từng loại
        const dataWithCounts = await Promise.all(
            categories.map(async (c) => {
                const count = await Product.countDocuments({
                    category: { $regex: new RegExp(`^${c.name}$`, "i") }
                });
                return {
                    _id: c._id,
                    name: c.name,
                    code: c.code,
                    description: c.description,
                    deviceCount: count,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt,
                };
            })
        );

        res.status(200).json({
            success: true,
            total: dataWithCounts.length,
            categories: dataWithCounts,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách loại thiết bị:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh mục thiết bị!" });
    }
};

// Tạo mới loại thiết bị
export const createCategory = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Vui lòng nhập tên loại thiết bị!" });
        }

        const trimmedName = name.trim();
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
        });

        if (existing) {
            return res.status(400).json({ message: `Loại thiết bị [${trimmedName}] đã tồn tại!` });
        }

        const generatedCode = code && code.trim()
            ? code.toUpperCase().trim()
            : trimmedName.split(" ").map(w => w[0]).join("").toUpperCase();

        const newCat = new Category({
            name: trimmedName,
            code: generatedCode,
            description: description ? description.trim() : "",
        });

        const saved = await newCat.save();

        res.status(201).json({
            message: `Thêm mới loại thiết bị [${saved.name}] thành công!`,
            category: saved,
        });
    } catch (error) {
        console.error("Lỗi tạo loại thiết bị:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo loại thiết bị: " + error.message });
    }
};

// Cập nhật thông tin loại thiết bị
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, description } = req.body;

        const cat = await Category.findById(id);
        if (!cat) {
            return res.status(404).json({ message: "Không tìm thấy loại thiết bị cần sửa!" });
        }

        const oldName = cat.name;

        if (name && name.trim()) {
            const trimmedName = name.trim();
            if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
                const duplicate = await Category.findOne({
                    _id: { $ne: id },
                    name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
                });
                if (duplicate) {
                    return res.status(400).json({ message: `Tên loại [${trimmedName}] đã được dùng cho loại thiết bị khác!` });
                }
                cat.name = trimmedName;

                // Đồng bộ cập nhật phân loại trong bảng thiết bị (Products)
                await Product.updateMany(
                    { category: oldName },
                    { $set: { category: trimmedName } }
                );
            }
        }

        if (code !== undefined) cat.code = code.toUpperCase().trim();
        if (description !== undefined) cat.description = description.trim();

        const updated = await cat.save();

        res.status(200).json({
            message: `Cập nhật loại thiết bị [${updated.name}] thành công!`,
            category: updated,
        });
    } catch (error) {
        console.error("Lỗi cập nhật loại thiết bị:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật loại thiết bị: " + error.message });
    }
};

// Xóa loại thiết bị
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const cat = await Category.findById(id);
        if (!cat) {
            return res.status(404).json({ message: "Không tìm thấy loại thiết bị cần xoá!" });
        }

        // Kiểm tra xem có thiết bị nào đang thuộc phân loại này không
        const productCount = await Product.countDocuments({ category: cat.name });
        if (productCount > 0) {
            return res.status(400).json({
                message: `Không thể xoá loại [${cat.name}] vì đang có ${productCount} thiết bị thuộc loại này! Vui lòng chuyển các thiết bị sang loại khác trước.`
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            message: `Đã xoá loại thiết bị [${cat.name}] thành công!`,
        });
    } catch (error) {
        console.error("Lỗi xoá loại thiết bị:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xoá loại thiết bị: " + error.message });
    }
};
