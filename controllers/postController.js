import Post from "../models/Post.js";
import Community from "../models/Community.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";

// @desc    Create a new post in a community
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        const { title, content, communityId } = req.body;

        if (!communityId) {
            return res.status(400).json({ message: "Community ID is required" });
        }

        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        const post = await Post.create({
            title,
            content,
            user: req.user._id,
            community: communityId,
        });

        // Optional: Notify all members of the community except the poster
        const membersToNotify = community.members.filter(
            (id) => id.toString() !== req.user._id.toString()
        );

        for (const memberId of membersToNotify) {
            await Notification.create({
                user: memberId,
                type: "post",
                message: `${req.user.username} added a new post in ${community.name}`,
                link: `/posts/${post._id}`,
            });
        }

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all posts (optionally filter by community)
// @route   GET /api/posts?communityId=<id>
// @access  Private
export const getPosts = async (req, res) => {
    try {
        const { communityId } = req.query;
        let filter = {};
        if (communityId) filter.community = communityId;

        const posts = await Post.find(filter)
            .populate("user", "username email")
            .populate("community", "name");

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get personalized feed (posts from communities the user joined)
// @route   GET /api/posts/feed
// @access  Private
export const getFeedPosts = async (req, res) => {
    try {
        const userCommunities = await Community.find({
            members: req.user._id,
        }).select("_id");

        const communityIds = userCommunities.map((c) => c._id);

        const posts = await Post.find({ community: { $in: communityIds } })
            .sort({ createdAt: -1 })
            .populate("user", "username email")
            .populate("community", "name");

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single post by ID (with comments)
// @route   GET /api/posts/:id
// @access  Private
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "username email")
            .populate("community", "name");

        if (!post) return res.status(404).json({ message: "Post not found" });

        const comments = await Comment.find({ postId: post._id })
            .populate("user", "username email")
            .sort({ createdAt: -1 });

        res.json({ post, comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Not authorized" });

        await post.deleteOne();
        res.json({ message: "Post removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
