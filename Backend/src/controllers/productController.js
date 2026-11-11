import QRCode from "qrcode";
import Product, { DEPARTMENTS } from "../models/Product.js";

// Hàm helper sinh mã QR Code (chứa link tra cứu hoặc thông tin tóm tắt)
const generateProductQRCode = async (product) => {
    try {
        const clientHost = process.env.CLIENT_URL || "http://localhost:5173";
        const scanUrl = `${clientHost}/scan/${encodeURIComponent(product.code)}`;
        
        // Tạo DataURL hình ảnh base64 QR Code sắc nét
        const qrDataUrl = await QRCode.toDataURL(scanUrl, {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 320,
            color: {
                dark: "#0f172a", // Màu xanh đen hiện đại
                light: "#ffffff",
            },
        });
        return qrDataUrl;
    } catch (err) {
        console.error("Lỗi sinh mã QR:", err);
        return "";
    }
};

// Lấy danh sách sản phẩm (có tìm kiếm, lọc theo phòng ban, phân trang)
export const getProducts = async (req, res) => {
    try {
        const { department, status, category, search, page = 1, limit = 50 } = req.query;

        const query = {};

        // Lọc theo phòng ban
        if (department && department !== "all") {
            query.department = department;
        }

        // Lọc theo tình trạng
        if (status && status !== "all") {
            query.status = status;
        }

        // Lọc theo loại thiết bị
        if (category && category !== "all") {
            query.category = category;
        }

        // Tìm kiếm toàn diện
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            query.$or = [
                { name: searchRegex },
                { code: searchRegex },
                { category: searchRegex },
                { department: searchRegex },
                { assignedVehicle: searchRegex },
                { serialNumber: searchRegex },
                { manager: searchRegex },
                { location: searchRegex },
                { specifications: searchRegex },
                { note: searchRegex },
            ];
        }

        const isGetAll = limit === "all" || limit === 0 || limit === "0";
        const total = await Product.countDocuments(query);

        let queryChain = Product.find(query).sort({ createdAt: -1 });
        if (!isGetAll) {
            const skip = (Number(page) - 1) * Number(limit);
            queryChain = queryChain.skip(skip).limit(Number(limit));
        }

        const products = await queryChain;

        res.status(200).json({
            success: true,
            total,
            page: isGetAll ? 1 : Number(page),
            totalPages: isGetAll ? 1 : Math.ceil(total / Number(limit)),
            products,
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm!" });
    }
};

// Tra cứu sản phẩm theo Mã ID khi quét QR (API công khai không cần login)
export const getProductByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const product = await Product.findOne({ code: code.toUpperCase().trim() });

        if (!product) {
            return res.status(404).json({
                message: `Không tìm thấy thiết bị mang mã định danh: ${code}`,
            });
        }

        res.status(200).json({
            success: true,
            product,
        });
    } catch (error) {
        console.error("Lỗi tra cứu mã thiết bị:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tra cứu mã QR!" });
    }
};

// Lấy danh sách 7 phòng ban kèm số lượng thiết bị thống kê
export const getDepartmentsSummary = async (req, res) => {
    try {
        const summary = await Promise.all(
            DEPARTMENTS.map(async (dept) => {
                const total = await Product.countDocuments({ department: dept });
                const active = await Product.countDocuments({ department: dept, status: "active" });
                const maintenance = await Product.countDocuments({ department: dept, status: "maintenance" });
                return {
                    name: dept,
                    total,
                    active,
                    maintenance,
                };
            })
        );

        res.status(200).json({
            departments: DEPARTMENTS,
            summary,
        });
    } catch (error) {
        console.error("Lỗi thống kê phòng ban:", error);
        res.status(500).json({ message: "Lỗi máy chủ!" });
    }
};

// Thêm mới sản phẩm/thiết bị (POST /api/products)
export const createProduct = async (req, res) => {
    try {
        const {
            code,
            name,
            category,
            department,
            manager,
            managerPhone,
            status,
            quantity,
            assignedVehicle,
            serialNumber,
            warrantyExpiry,
            purchaseDate,
            maintenanceReason,
            location,
            specifications,
            note,
        } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!code || !name || !department) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ: Mã thiết bị, Tên thiết bị và Phòng ban / Vị trí!",
            });
        }

        const normalizedCode = code.toUpperCase().trim();

        // Kiểm tra mã thiết bị đã tồn tại chưa
        const existing = await Product.findOne({ code: normalizedCode });
        if (existing) {
            return res.status(400).json({
                message: `Mã thiết bị '${normalizedCode}' đã tồn tại trên hệ thống! Vui lòng chọn mã khác.`,
            });
        }

        // Tạo đối tượng sản phẩm mới
        const newProduct = new Product({
            code: normalizedCode,
            name: name.trim(),
            category: category ? category.trim() : "Laptop (Máy tính xách tay)",
            department: department.trim(),
            manager: manager ? manager.trim() : "Ban Quản Lý",
            managerPhone: managerPhone ? managerPhone.trim() : "",
            status: status || "Hoạt động",
            quantity: quantity ? Math.max(1, Number(quantity)) : 1,
            assignedVehicle: assignedVehicle ? assignedVehicle.trim() : "",
            serialNumber: serialNumber ? serialNumber.trim() : "",
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : Date.now(),
            maintenanceReason: maintenanceReason ? maintenanceReason.trim() : "",
            location: location ? location.trim() : "",
            specifications: specifications ? specifications.trim() : "",
            note: note ? note.trim() : "",
        });

        // Tự động tạo mã QR Code
        newProduct.qrCode = await generateProductQRCode(newProduct);

        // Lưu vào MongoDB
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Thêm mới thiết bị và tạo mã QR thành công!",
            product: savedProduct,
        });
    } catch (error) {
        console.error("Lỗi tạo mới sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi tạo mới thiết bị: " + error.message });
    }
};

// Cập nhật thông tin sản phẩm (PUT /api/products/:id)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            name,
            category,
            department,
            manager,
            managerPhone,
            status,
            quantity,
            assignedVehicle,
            serialNumber,
            warrantyExpiry,
            purchaseDate,
            maintenanceReason,
            location,
            specifications,
            note,
        } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
        }

        // Nếu thay đổi mã code, kiểm tra trùng lặp
        if (code && code.toUpperCase().trim() !== product.code) {
            const codeExists = await Product.findOne({ code: code.toUpperCase().trim() });
            if (codeExists) {
                return res.status(400).json({
                    message: `Mã thiết bị '${code.toUpperCase().trim()}' đã có thiết bị khác sử dụng!`,
                });
            }
            product.code = code.toUpperCase().trim();
        }

        if (name) product.name = name.trim();
        if (category) product.category = category.trim();
        if (department) product.department = department.trim();
        if (manager !== undefined) product.manager = manager.trim() || "Ban Quản Lý";
        if (managerPhone !== undefined) product.managerPhone = managerPhone.trim();
        if (status) product.status = status;
        if (quantity !== undefined) product.quantity = Math.max(1, Number(quantity) || 1);
        if (assignedVehicle !== undefined) product.assignedVehicle = assignedVehicle.trim();
        if (serialNumber !== undefined) product.serialNumber = serialNumber.trim();
        if (warrantyExpiry !== undefined) product.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null;
        if (purchaseDate !== undefined) product.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
        if (maintenanceReason !== undefined) product.maintenanceReason = maintenanceReason.trim();
        if (location !== undefined) product.location = location.trim();
        if (specifications !== undefined) product.specifications = specifications.trim();
        if (note !== undefined) product.note = note.trim();

        // Tái tạo lại mã QR nếu có thay đổi thông tin định danh
        product.qrCode = await generateProductQRCode(product);

        const updated = await product.save();

        res.status(200).json({
            message: "Cập nhật thông tin thiết bị thành công!",
            product: updated,
        });
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật thiết bị: " + error.message });
    }
};

// Xóa sản phẩm (DELETE /api/products/:id)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Product.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm cần xoá!" });
        }

        res.status(200).json({
            message: `Đã xoá thiết bị [${deleted.code} - ${deleted.name}] thành công!`,
        });
    } catch (error) {
        console.error("Lỗi xoá sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi xoá sản phẩm!" });
    }

    r
};
