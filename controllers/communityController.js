import Community from "../models/Community.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

export const createCommunity = async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Community name is required" });
  }

  const trimmedName = name.trim();
  const communityExists = await Community.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
  });
  if (communityExists) {
    return res.status(400).json({ message: "Community name already taken" });
  }

  const community = await Community.create({
    name: trimmedName,
    description: description?.trim() || "",
    creator: req.user._id,
    members: [req.user._id],
  });

  const populated = await Community.findById(community._id).populate(
    "creator",
    "username email avatar"
  );

  res.status(201).json(populated);
};

export const getCommunities = async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search?.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const communities = await Community.find(filter)
    .populate("creator", "username email avatar")
    .sort({ createdAt: -1 });

  res.json(communities);
};

export const getCommunityById = async (req, res) => {
  const community = await Community.findById(req.params.id)
    .populate("creator", "username email avatar")
    .populate("members", "username email avatar");

  if (!community) return res.status(404).json({ message: "Community not found" });

  const postCount = await Post.countDocuments({ community: community._id });

  res.json({ ...community.toObject(), postCount });
};

export const joinCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ message: "Community not found" });

  const alreadyMember = community.members.some(
    (memberId) => memberId.toString() === req.user._id.toString()
  );
  if (alreadyMember) {
    return res.status(400).json({ message: "Already a member" });
  }

  community.members.push(req.user._id);
  await community.save();
  res.json({ message: "Joined community successfully", community });
};

export const leaveCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ message: "Community not found" });

  if (community.creator.toString() === req.user._id.toString()) {
    return res.status(400).json({
      message: "Community creators cannot leave. Delete the community instead.",
    });
  }

  community.members = community.members.filter(
    (memberId) => memberId.toString() !== req.user._id.toString()
  );
  await community.save();
  res.json({ message: "Left community successfully" });
};

export const deleteCommunity = async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) return res.status(404).json({ message: "Community not found" });

  if (community.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized to delete this community" });
  }

  const postIds = await Post.find({ community: community._id }).distinct("_id");
  if (postIds.length > 0) {
    await Comment.deleteMany({ post: { $in: postIds } });
    await Post.deleteMany({ community: community._id });
  }

  await community.deleteOne();
  res.json({ message: "Community deleted" });
};
