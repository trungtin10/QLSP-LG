import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Tự động tạo trường createdAt và updatedAt
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;