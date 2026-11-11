import Department from "../models/Department.js";
import Product from "../models/Product.js";

const DEFAULT_DEPARTMENTS_SEED = [
    { name: "Phòng Thi Lý Thuyết", code: "P_LYTHUYET", area: "Tầng 2 - Nhà Điều Hành", description: "Gồm 30 máy trạm thi lý thuyết và 01 máy chủ điều hành" },
    { name: "Phòng Thi Mô Phỏng", code: "P_MOPHONG", area: "Tầng 2 - Nhà Điều Hành", description: "Gồm 15 máy tính mô phỏng cabin giao thông" },
    { name: "Phòng Máy Chủ & Giám Sát", code: "P_SERVER", area: "Tầng 3 - Nhà Điều Hành", description: "Chứa hệ thống Server dữ liệu, Switch mạng và màn hình camera sân thi" },
    { name: "Sân Sát Hạch Sa Hình", code: "SAN_SATHACH", area: "Khu vực sân bãi", description: "Khu vực xe thi sát hạch các hạng B1, B2, C" },
    { name: "Đội Xe Tập Lái Thực Hành", code: "XE_TAPLAI", area: "Khu vực xe thực hành", description: "Các xe gắn thiết bị DAT chạy đường trường và sân tập" },
    { name: "Phòng Tuyển Sinh", code: "P_TUYENSINH", area: "Tầng 1 - Nhà Điều Hành", description: "Tiếp nhận hồ sơ và tư vấn học viên" },
    { name: "Phòng Đào Tạo", code: "P_DAOTAO", area: "Tầng 2 - Nhà Điều Hành", description: "Xếp lịch học và quản lý tiến độ đào tạo" },
    { name: "Phòng Kế Toán", code: "P_KETOAN", area: "Tầng 1 - Nhà Điều Hành", description: "Quản lý thu chi học phí và tài sản" },
    { name: "Kho Lưu Trữ Thiết Bị", code: "KHO_THIETBI", area: "Tầng 1 - Kho vật tư", description: "Lưu kho máy móc, linh kiện dự phòng" },
];

// Lấy danh sách tất cả phòng ban kèm số lượng thiết bị thực tế
export const getDepartments = async (req, res) => {
    try {
        let departments = await Department.find().sort({ createdAt: 1 });

        // Tự động khởi tạo dữ liệu mẫu nếu chưa có
        if (departments.length === 0) {
            await Department.insertMany(DEFAULT_DEPARTMENTS_SEED);
            departments = await Department.find().sort({ createdAt: 1 });
        }

        // Đếm số lượng thiết bị thuộc từng phòng ban
        const dataWithCounts = await Promise.all(
            departments.map(async (d) => {
                const count = await Product.countDocuments({
                    department: { $regex: new RegExp(`^${d.name}$`, "i") }
                });
                return {
                    _id: d._id,
                    name: d.name,
                    code: d.code,
                    area: d.area,
                    description: d.description,
                    deviceCount: count,
                    createdAt: d.createdAt,
                    updatedAt: d.updatedAt,
                };
            })
        );

        res.status(200).json({
            success: true,
            total: dataWithCounts.length,
            departments: dataWithCounts,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi lấy danh sách phòng ban!" });
    }
};

// Tạo mới phòng ban / vị trí
export const createDepartment = async (req, res) => {
    try {
        const { name, code, area, description } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Vui lòng nhập tên phòng ban / vị trí!" });
        }

        const trimmedName = name.trim();
        const existing = await Department.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
        });

        if (existing) {
            return res.status(400).json({ message: `Phòng ban [${trimmedName}] đã tồn tại!` });
        }

        const generatedCode = code && code.trim() 
            ? code.toUpperCase().trim() 
            : trimmedName.split(" ").map(w => w[0]).join("").toUpperCase();

        const newDept = new Department({
            name: trimmedName,
            code: generatedCode,
            area: area ? area.trim() : "Nhà Điều Hành",
            description: description ? description.trim() : "",
        });

        const saved = await newDept.save();

        res.status(201).json({
            message: `Thêm mới phòng ban [${saved.name}] thành công!`,
            department: saved,
        });
    } catch (error) {
        console.error("Lỗi tạo phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi tạo phòng ban: " + error.message });
    }
};

// Cập nhật thông tin phòng ban / vị trí
export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, area, description } = req.body;

        const dept = await Department.findById(id);
        if (!dept) {
            return res.status(404).json({ message: "Không tìm thấy phòng ban cần sửa!" });
        }

        const oldName = dept.name;

        if (name && name.trim()) {
            const trimmedName = name.trim();
            if (trimmedName.toLowerCase() !== oldName.toLowerCase()) {
                const duplicate = await Department.findOne({
                    _id: { $ne: id },
                    name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
                });
                if (duplicate) {
                    return res.status(400).json({ message: `Tên phòng ban [${trimmedName}] đã có phòng khác sử dụng!` });
                }
                dept.name = trimmedName;

                // Đồng bộ cập nhật tên phòng ban trong bảng thiết bị (Products)
                await Product.updateMany(
                    { department: oldName },
                    { $set: { department: trimmedName } }
                );
            }
        }

        if (code !== undefined) dept.code = code.toUpperCase().trim();
        if (area !== undefined) dept.area = area.trim();
        if (description !== undefined) dept.description = description.trim();

        const updated = await dept.save();

        res.status(200).json({
            message: `Cập nhật phòng ban [${updated.name}] thành công!`,
            department: updated,
        });
    } catch (error) {
        console.error("Lỗi cập nhật phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi cập nhật phòng ban: " + error.message });
    }
};

// Xóa phòng ban / vị trí
export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const dept = await Department.findById(id);
        if (!dept) {
            return res.status(404).json({ message: "Không tìm thấy phòng ban cần xoá!" });
        }

        // Kiểm tra xem có thiết bị nào đang thuộc phòng ban này không
        const productCount = await Product.countDocuments({ department: dept.name });
        if (productCount > 0) {
            return res.status(400).json({
                message: `Không thể xoá phòng ban [${dept.name}] vì đang có ${productCount} thiết bị trực thuộc! Vui lòng chuyển các thiết bị sang phòng khác trước.`
            });
        }

        await Department.findByIdAndDelete(id);

        res.status(200).json({
            message: `Đã xoá phòng ban [${dept.name}] thành công!`,
        });
    } catch (error) {
        console.error("Lỗi xoá phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ khi xoá phòng ban: " + error.message });
    }
};
