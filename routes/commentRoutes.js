import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    addComment,
    getCommentsByPost,
    deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Add comment
router.post("/", protect, addComment);

// Get all comments for a post
router.get("/:postId", getCommentsByPost);

// Delete a comment
router.delete("/:id", protect, deleteComment);

export default router;
