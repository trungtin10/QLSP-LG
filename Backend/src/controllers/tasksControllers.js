import Task from "../models/Task.js";

// Lấy danh sách tất cả nhiệm vụ
export const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách nhiệm vụ" });
    }
};

// Tạo mới một nhiệm vụ (POST)
export const createTask = async (req, res) => {
    try {
        const { title, description, status, completed } = req.body;

        // Kiểm tra dữ liệu đầu vào bắt buộc
        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Tiêu đề (title) là bắt buộc" });
        }

        // Tạo đối tượng task mới (tránh đặt trùng tên biến với Model Task)
        const newTask = new Task({
            title: title.trim(),
            description: description ? description.trim() : "",
            status: status || "pending",
            completed: completed || false,
        });

        // Lưu vào CSDL
        const savedTask = await newTask.save();

        res.status(201).json({
            message: "Tạo nhiệm vụ thành công",
            task: savedTask,
        });
    } catch (error) {
        console.error("Lỗi khi tạo nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi hệ thống khi tạo nhiệm vụ" });
    }
};

// Cập nhật nhiệm vụ (PUT)
export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedTask) {
            return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
        }

        res.status(200).json({
            message: "Cập nhật nhiệm vụ thành công",
            task: updatedTask,
        });
    } catch (error) {
        console.error("Lỗi khi cập nhật nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật nhiệm vụ" });
    }
};

// Xoá nhiệm vụ (DELETE)
export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: "Không tìm thấy nhiệm vụ" });
        }

        res.status(200).json({ message: "Xoá nhiệm vụ thành công" });
    } catch (error) {
        console.error("Lỗi khi xoá nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi khi xoá nhiệm vụ" });
    }
};
