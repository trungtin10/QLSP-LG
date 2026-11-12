import QRCode from "qrcode";
import Product, { DEPARTMENTS } from "../models/Product.js";

// Hàm helper xác định chính xác domain của hệ thống đang chạy
export const getClientHost = (req = null) => {
    // 1. Biến môi trường do Render tự động cấp (ví dụ: https://qlsp-lg.onrender.com)
    if (process.env.RENDER_EXTERNAL_URL) {
        return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
    }
    // 2. Biến CLIENT_URL nếu được set thủ công và không phải localhost
    if (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes("localhost")) {
        return process.env.CLIENT_URL.replace(/\/$/, "");
    }
    // 3. Nhận diện từ Header request client gửi lên
    if (req) {
        const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
        const host = req.get("host");
        if (host && !host.includes("localhost")) {
            return `${proto}://${host}`;
        }
    }
    // 4. Nếu có CLIENT_URL bất kỳ
    if (process.env.CLIENT_URL) {
        return process.env.CLIENT_URL.replace(/\/$/, "");
    }
    // 5. Fallback khi dev local
    return req ? `${req.protocol}://${req.get("host")}` : `http://localhost:${process.env.PORT || 5001}`;
};

// Hàm helper sinh mã QR Code (chứa link tra cứu hoặc thông tin tóm tắt)
export const generateProductQRCode = async (product, req = null) => {
    try {
        const clientHost = getClientHost(req);
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

// Đồng bộ / Làm mới toàn bộ mã QR của các thiết bị theo domain hiện tại
export const syncAllProductQRCodes = async (req, res) => {
    try {
        const clientHost = getClientHost(req);
        const products = await Product.find({});
        let updatedCount = 0;

        for (const p of products) {
            p.qrCode = await generateProductQRCode(p, req);
            await p.save();
            updatedCount++;
        }

        res.status(200).json({
            success: true,
            message: `Đã làm mới mã QR cho ${updatedCount} thiết bị theo địa chỉ: ${clientHost}`,
            clientHost,
            updatedCount,
        });
    } catch (err) {
        console.error("Lỗi đồng bộ mã QR:", err);
        res.status(500).json({ message: "Lỗi máy chủ khi làm mới mã QR!" });
    }
};

// Chuẩn hóa cơ cấu số lượng theo trạng thái nếu dữ liệu cũ chưa có breakdown
export const normalizeProductBreakdown = (p) => {
    if (!p) return null;
    const doc = p.toObject ? p.toObject() : { ...p };
    const total = Math.max(1, Number(doc.quantity) || 1);
    
    if (doc.quantityActive === undefined || doc.quantityActive === null) {
        if (doc.status === "Đang bảo trì" || doc.status === "maintenance") {
            doc.quantityMaintenance = total;
            doc.quantityActive = 0;
            doc.quantityStorage = 0;
            doc.quantityBroken = 0;
        } else if (doc.status === "Dự phòng" || doc.status === "storage") {
            doc.quantityStorage = total;
            doc.quantityActive = 0;
            doc.quantityMaintenance = 0;
            doc.quantityBroken = 0;
        } else if (doc.status === "Hỏng" || doc.status === "broken" || doc.status === "Thanh lý") {
            doc.quantityBroken = total;
            doc.quantityActive = 0;
            doc.quantityMaintenance = 0;
            doc.quantityStorage = 0;
        } else {
            doc.quantityActive = total;
            doc.quantityMaintenance = 0;
            doc.quantityStorage = 0;
            doc.quantityBroken = 0;
        }
    } else {
        doc.quantityActive = Number(doc.quantityActive) || 0;
        doc.quantityMaintenance = Number(doc.quantityMaintenance) || 0;
        doc.quantityStorage = Number(doc.quantityStorage) || 0;
        doc.quantityBroken = Number(doc.quantityBroken) || 0;
        doc.quantity = doc.quantityActive + doc.quantityMaintenance + doc.quantityStorage + doc.quantityBroken;
    }
    return doc;
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
        const normalizedProducts = products.map(normalizeProductBreakdown);

        res.status(200).json({
            success: true,
            total,
            page: isGetAll ? 1 : Number(page),
            totalPages: isGetAll ? 1 : Math.ceil(total / Number(limit)),
            products: normalizedProducts,
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
            product: normalizeProductBreakdown(product),
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
            quantityActive,
            quantityMaintenance,
            quantityStorage,
            quantityBroken,
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

        const totalQty = quantity ? Math.max(1, Number(quantity)) : 1;
        let act = quantityActive !== undefined ? Number(quantityActive) : totalQty;
        let main = quantityMaintenance !== undefined ? Number(quantityMaintenance) : 0;
        let stor = quantityStorage !== undefined ? Number(quantityStorage) : 0;
        let brok = quantityBroken !== undefined ? Number(quantityBroken) : 0;

        if (status === "Đang bảo trì" && quantityMaintenance === undefined) {
            main = totalQty;
            act = 0;
        } else if (status === "Dự phòng" && quantityStorage === undefined) {
            stor = totalQty;
            act = 0;
        } else if ((status === "Hỏng" || status === "Thanh lý") && quantityBroken === undefined) {
            brok = totalQty;
            act = 0;
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
            quantity: act + main + stor + brok,
            quantityActive: act,
            quantityMaintenance: main,
            quantityStorage: stor,
            quantityBroken: brok,
            assignedVehicle: assignedVehicle ? assignedVehicle.trim() : "",
            serialNumber: serialNumber ? serialNumber.trim() : "",
            warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : Date.now(),
            maintenanceReason: maintenanceReason ? maintenanceReason.trim() : "",
            location: location ? location.trim() : "",
            specifications: specifications ? specifications.trim() : "",
            note: note ? note.trim() : "",
            history: [
                {
                    action: "created",
                    title: `Khởi tạo thiết bị mới với tổng số lượng: ${totalQty}`,
                    quantity: totalQty,
                    toDepartment: department.trim(),
                    performedBy: req.user?.fullName || req.user?.username || "Admin",
                    createdAt: new Date(),
                }
            ],
        });

        // Tự động tạo mã QR Code
        newProduct.qrCode = await generateProductQRCode(newProduct, req);

        // Lưu vào MongoDB
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Thêm mới thiết bị và tạo mã QR thành công!",
            product: normalizeProductBreakdown(savedProduct),
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
            quantityActive,
            quantityMaintenance,
            quantityStorage,
            quantityBroken,
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

        if (quantityActive !== undefined) product.quantityActive = Math.max(0, Number(quantityActive));
        if (quantityMaintenance !== undefined) product.quantityMaintenance = Math.max(0, Number(quantityMaintenance));
        if (quantityStorage !== undefined) product.quantityStorage = Math.max(0, Number(quantityStorage));
        if (quantityBroken !== undefined) product.quantityBroken = Math.max(0, Number(quantityBroken));

        if (quantity !== undefined && quantityActive === undefined && quantityMaintenance === undefined) {
            product.quantity = Math.max(1, Number(quantity) || 1);
            product.quantityActive = product.quantity;
            product.quantityMaintenance = 0;
        } else {
            product.quantity = (product.quantityActive || 0) + 
                               (product.quantityMaintenance || 0) + 
                               (product.quantityStorage || 0) + 
                               (product.quantityBroken || 0);
        }

        if (assignedVehicle !== undefined) product.assignedVehicle = assignedVehicle.trim();
        if (serialNumber !== undefined) product.serialNumber = serialNumber.trim();
        if (warrantyExpiry !== undefined) product.warrantyExpiry = warrantyExpiry ? new Date(warrantyExpiry) : null;
        if (purchaseDate !== undefined) product.purchaseDate = purchaseDate ? new Date(purchaseDate) : null;
        if (maintenanceReason !== undefined) product.maintenanceReason = maintenanceReason.trim();
        if (location !== undefined) product.location = location.trim();
        if (specifications !== undefined) product.specifications = specifications.trim();
        if (note !== undefined) product.note = note.trim();

        // Tái tạo lại mã QR nếu có thay đổi thông tin định danh
        product.qrCode = await generateProductQRCode(product, req);

        const updated = await product.save();

        res.status(200).json({
            message: "Cập nhật thông tin thiết bị thành công!",
            product: normalizeProductBreakdown(updated),
        });
    } catch (error) {
        console.error("Lỗi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật thiết bị: " + error.message });
    }
};

// Thao tác gửi đi bảo trì hoặc hoàn tất sửa chữa (POST /api/products/:id/maintenance)
export const handleMaintenanceAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, quantity = 1, reason = "", performedBy = "" } = req.body;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy thiết bị!" });
        }

        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const performer = performedBy || req.user?.fullName || req.user?.username || "Admin";

        // Chuẩn hóa breakdown nếu chưa có
        if (product.quantityActive === undefined || product.quantityActive === null) {
            if (product.status === "Đang bảo trì") {
                product.quantityMaintenance = product.quantity || 1;
                product.quantityActive = 0;
            } else {
                product.quantityActive = product.quantity || 1;
                product.quantityMaintenance = 0;
            }
        }

        if (action === "start") {
            // Đưa máy đi bảo dưỡng / sửa chữa
            if (product.quantityActive < qty) {
                return res.status(400).json({
                    message: `Chỉ có ${product.quantityActive} thiết bị đang hoạt động để gửi đi bảo trì (yêu cầu: ${qty})!`,
                });
            }

            product.quantityActive -= qty;
            product.quantityMaintenance = (product.quantityMaintenance || 0) + qty;
            if (reason.trim()) {
                product.maintenanceReason = reason.trim();
            }

            if (product.quantityActive === 0) {
                product.status = "Đang bảo trì";
            }

            product.history.unshift({
                action: "maintenance_start",
                title: `Gửi đi bảo trì / sửa chữa ${qty} thiết bị`,
                quantity: qty,
                fromDepartment: product.department,
                toDepartment: product.department,
                reason: reason.trim() || "Báo hỏng / bảo dưỡng định kỳ",
                performedBy: performer,
                createdAt: new Date(),
            });

            await product.save();

            return res.status(200).json({
                success: true,
                message: `Đã đưa ${qty} thiết bị vào danh sách bảo trì thành công!`,
                product: normalizeProductBreakdown(product),
            });
        } else if (action === "finish") {
            // Hoàn tất sửa chữa, đưa máy về hoạt động
            if ((product.quantityMaintenance || 0) < qty) {
                return res.status(400).json({
                    message: `Hiện chỉ có ${product.quantityMaintenance || 0} thiết bị đang bảo trì để hoàn tất (yêu cầu: ${qty})!`,
                });
            }

            product.quantityMaintenance = Math.max(0, (product.quantityMaintenance || 0) - qty);
            product.quantityActive = (product.quantityActive || 0) + qty;

            if (product.quantityMaintenance === 0) {
                product.maintenanceReason = "";
            }
            product.status = "Hoạt động";

            product.history.unshift({
                action: "maintenance_end",
                title: `Hoàn tất sửa chữa, đưa ${qty} thiết bị về hoạt động`,
                quantity: qty,
                fromDepartment: product.department,
                toDepartment: product.department,
                reason: reason.trim() || "Đã kiểm tra hoạt động tốt",
                performedBy: performer,
                createdAt: new Date(),
            });

            await product.save();

            return res.status(200).json({
                success: true,
                message: `Đã hoàn tất sửa chữa cho ${qty} thiết bị và đưa vào hoạt động!`,
                product: normalizeProductBreakdown(product),
            });
        } else {
            return res.status(400).json({ message: "Hành động bảo trì không hợp lệ (start | finish)!" });
        }
    } catch (error) {
        console.error("Lỗi thao tác bảo trì:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật bảo trì: " + error.message });
    }
};

// Thao tác điều chuyển thiết bị giữa các phòng ban / xuất kho (POST /api/products/:id/transfer)
export const handleTransferAction = async (req, res) => {
    try {
        const { id } = req.params;
        const { toDepartment, quantity = 1, reason = "", performedBy = "" } = req.body;

        if (!toDepartment || !toDepartment.trim()) {
            return res.status(400).json({ message: "Vui lòng chọn phòng ban / vị trí tiếp nhận!" });
        }

        const sourceProduct = await Product.findById(id);
        if (!sourceProduct) {
            return res.status(404).json({ message: "Không tìm thấy thiết bị nguồn!" });
        }

        const targetDept = toDepartment.trim();
        if (targetDept === sourceProduct.department) {
            return res.status(400).json({ message: "Phòng ban tiếp nhận phải khác phòng ban hiện tại!" });
        }

        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const performer = performedBy || req.user?.fullName || req.user?.username || "Admin";

        if (sourceProduct.quantityActive === undefined || sourceProduct.quantityActive === null) {
            sourceProduct.quantityActive = sourceProduct.quantity || 1;
            sourceProduct.quantityMaintenance = 0;
            sourceProduct.quantityStorage = 0;
        }

        const available = (sourceProduct.quantityActive || 0) + (sourceProduct.quantityStorage || 0);
        if (available < qty) {
            return res.status(400).json({
                message: `Số lượng khả dụng tại [${sourceProduct.department}] chỉ còn ${available} máy, không đủ chuyển ${qty} máy!`,
            });
        }

        // Trừ từ kho trước, nếu không đủ thì trừ từ hoạt động
        if ((sourceProduct.quantityStorage || 0) >= qty) {
            sourceProduct.quantityStorage -= qty;
        } else {
            const fromStorage = sourceProduct.quantityStorage || 0;
            sourceProduct.quantityStorage = 0;
            sourceProduct.quantityActive -= (qty - fromStorage);
        }

        sourceProduct.quantity = (sourceProduct.quantityActive || 0) + 
                                (sourceProduct.quantityMaintenance || 0) + 
                                (sourceProduct.quantityStorage || 0) + 
                                (sourceProduct.quantityBroken || 0);

        sourceProduct.history.unshift({
            action: "transfer_out",
            title: `Điều chuyển ${qty} thiết bị sang [${targetDept}]`,
            quantity: qty,
            fromDepartment: sourceProduct.department,
            toDepartment: targetDept,
            reason: reason.trim() || "Điều chuyển phân bổ trang thiết bị",
            performedBy: performer,
            createdAt: new Date(),
        });

        await sourceProduct.save();

        // Kiểm tra xem ở phòng ban đích đã có thiết bị cùng tên và cùng loại chưa
        let targetProduct = await Product.findOne({
            name: sourceProduct.name,
            category: sourceProduct.category,
            department: targetDept,
        });

        if (targetProduct) {
            targetProduct.quantityActive = (targetProduct.quantityActive || targetProduct.quantity || 0) + qty;
            targetProduct.quantity = (targetProduct.quantityActive || 0) + 
                                    (targetProduct.quantityMaintenance || 0) + 
                                    (targetProduct.quantityStorage || 0) + 
                                    (targetProduct.quantityBroken || 0);

            targetProduct.history.unshift({
                action: "transfer_in",
                title: `Tiếp nhận ${qty} thiết bị điều chuyển từ [${sourceProduct.department}]`,
                quantity: qty,
                fromDepartment: sourceProduct.department,
                toDepartment: targetDept,
                reason: reason.trim() || "Tiếp nhận thiết bị phân bổ",
                performedBy: performer,
                createdAt: new Date(),
            });

            await targetProduct.save();
        } else {
            const cleanDept = targetDept.replace(/\s+/g, "").substring(0, 3).toUpperCase();
            const newCode = `${sourceProduct.code}-${cleanDept}-${Math.floor(10 + Math.random() * 90)}`;

            targetProduct = new Product({
                code: newCode,
                name: sourceProduct.name,
                category: sourceProduct.category,
                department: targetDept,
                manager: sourceProduct.manager,
                managerPhone: sourceProduct.managerPhone,
                status: "Hoạt động",
                quantity: qty,
                quantityActive: qty,
                quantityMaintenance: 0,
                quantityStorage: 0,
                specifications: sourceProduct.specifications,
                purchaseDate: sourceProduct.purchaseDate,
                history: [
                    {
                        action: "transfer_in",
                        title: `Tiếp nhận ${qty} thiết bị điều chuyển từ [${sourceProduct.department}]`,
                        quantity: qty,
                        fromDepartment: sourceProduct.department,
                        toDepartment: targetDept,
                        reason: reason.trim() || "Tiếp nhận thiết bị phân bổ",
                        performedBy: performer,
                        createdAt: new Date(),
                    }
                ],
            });

            targetProduct.qrCode = await generateProductQRCode(targetProduct, req);
            await targetProduct.save();
        }

        res.status(200).json({
            success: true,
            message: `Đã điều chuyển thành công ${qty} thiết bị từ [${sourceProduct.department}] sang [${targetDept}]!`,
            sourceProduct: normalizeProductBreakdown(sourceProduct),
            targetProduct: normalizeProductBreakdown(targetProduct),
        });
    } catch (error) {
        console.error("Lỗi điều chuyển thiết bị:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi điều chuyển thiết bị: " + error.message });
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
};
