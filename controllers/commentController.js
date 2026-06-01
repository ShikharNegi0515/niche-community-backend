import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

const userFields = "username email avatar";

export const addComment = async (req, res) => {
  const { postId, content } = req.body;

  if (!postId || !content?.trim()) {
    return res.status(400).json({ message: "Post ID and comment content are required" });
  }

  const post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const comment = await Comment.create({
    post: postId,
    user: req.user._id,
    content: content.trim(),
  });

  if (post.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: post.user,
      type: "comment",
      message: `${req.user.username} commented on your post`,
      link: `/posts/${post._id}`,
    });
  }

  const populated = await Comment.findById(comment._id).populate("user", userFields);
  res.status(201).json(populated);
};

export const getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .populate("user", userFields)
    .sort({ createdAt: -1 });

  res.json(comments);
};

export const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
};
