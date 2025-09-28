import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createPost,
    getPosts,
    getFeedPosts,
    getPostById,
    updatePost,
    deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// Personalized feed (must be before /:id to avoid conflict)
router.get("/feed", protect, getFeedPosts);

// Create a post
router.post("/", protect, createPost);

// Get all posts (optionally filtered by community)
router.get("/", protect, getPosts);

// Get single post by ID with comments
router.get("/:id", protect, getPostById);

// Update post
router.put("/:id", protect, updatePost);

// Delete post
router.delete("/:id", protect, deletePost);

export default router;
