import Post from "../models/Post.js";
import Community from "../models/Community.js";
import Comment from "../models/Comment.js";
import Notification from "../models/Notification.js";

const userFields = "username email avatar";
const communityFields = "name description";

async function populatePost(query) {
  return query.populate("user", userFields).populate("community", communityFields);
}

export const createPost = async (req, res) => {
  const { title, content, communityId } = req.body;

  if (!title?.trim() || !content?.trim() || !communityId) {
    return res.status(400).json({ message: "Title, content, and community are required" });
  }

  const community = await Community.findById(communityId);
  if (!community) {
    return res.status(404).json({ message: "Community not found" });
  }

  const isMember = community.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json({ message: "Join this community before posting" });
  }

  const post = await Post.create({
    title: title.trim(),
    content: content.trim(),
    user: req.user._id,
    community: communityId,
  });

  community.posts.push(post._id);
  await community.save();

  const membersToNotify = community.members.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await Promise.all(
    membersToNotify.map((memberId) =>
      Notification.create({
        user: memberId,
        type: "post",
        message: `${req.user.username} posted in ${community.name}`,
        link: `/posts/${post._id}`,
      })
    )
  );

  const populated = await populatePost(Post.findById(post._id));
  res.status(201).json(populated);
};

export const getPosts = async (req, res) => {
  const { communityId } = req.query;
  const filter = communityId ? { community: communityId } : {};

  const community = communityId ? await Community.findById(communityId) : null;
  if (communityId && !community) {
    return res.status(404).json({ message: "Community not found" });
  }

  if (community) {
    const isMember = community.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Join this community to view posts" });
    }
  }

  const posts = await populatePost(
    Post.find(filter).sort({ createdAt: -1 })
  );

  res.json(posts);
};

export const getFeedPosts = async (req, res) => {
  const userCommunities = await Community.find({ members: req.user._id }).select("_id");
  const communityIds = userCommunities.map((c) => c._id);

  if (communityIds.length === 0) {
    return res.json([]);
  }

  const posts = await populatePost(
    Post.find({ community: { $in: communityIds } }).sort({ createdAt: -1 })
  );

  res.json(posts);
};

export const getPostById = async (req, res) => {
  const post = await populatePost(Post.findById(req.params.id));

  if (!post) return res.status(404).json({ message: "Post not found" });

  const community = await Community.findById(post.community._id || post.community);
  if (community) {
    const isMember = community.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: "Join this community to view this post" });
    }
  }

  const comments = await Comment.find({ post: post._id })
    .populate("user", userFields)
    .sort({ createdAt: -1 });

  res.json({ post, comments });
};

export const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to edit this post" });
  }

  if (req.body.title?.trim()) post.title = req.body.title.trim();
  if (req.body.content?.trim()) post.content = req.body.content.trim();

  await post.save();
  const populated = await populatePost(Post.findById(post._id));
  res.json(populated);
};

export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this post" });
  }

  await Community.findByIdAndUpdate(post.community, { $pull: { posts: post._id } });
  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: "Post removed" });
};
