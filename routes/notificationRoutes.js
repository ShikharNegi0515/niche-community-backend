import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get all notifications for logged-in user
router.get("/", protect, getNotifications);

// Mark a single notification as read
router.put("/:id/read", protect, markAsRead);

// Mark all notifications as read
router.put("/read-all", protect, markAllAsRead);

export default router;
