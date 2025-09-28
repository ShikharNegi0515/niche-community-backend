import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // The user who receives the notification
        },
        type: {
            type: String,
            enum: ["comment", "post", "join", "other"],
            default: "other",
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String, // frontend link to redirect on click
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
