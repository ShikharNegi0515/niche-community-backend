import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// @desc    Add a comment to a post
// @route   POST /api/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { postId, content } = req.body;

        if (!postId || !content) {
            return res.status(400).json({ message: "Post ID and content are required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = await Comment.create({
            post: postId,
            user: req.user._id,
            content,
        });

        // Create notification for post owner if commenter is not the post owner
        if (post.user.toString() !== req.user._id.toString()) {
            await Notification.create({
                user: post.user,
                type: "comment",
                message: `${req.user.username} commented on your post`,
                link: `/posts/${post._id}`,
            });
        }

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all comments for a post
// @route   GET /api/comments/:postId
// @access  Public
export const getCommentsByPost = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .populate("user", "username email")
            .populate("replies");

        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (only comment owner)
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        await comment.deleteOne();
        res.json({ message: "Comment deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
