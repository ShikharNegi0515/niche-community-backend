import Community from "../models/Community.js";
import Post from "../models/Post.js";

// Create a new community
export const createCommunity = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Community name is required" });

        const communityExists = await Community.findOne({ name });
        if (communityExists) return res.status(400).json({ message: "Community name already taken" });

        const community = await Community.create({
            name,
            description,
            creator: req.user._id,
            members: [req.user._id],
        });

        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all communities
export const getCommunities = async (req, res) => {
    try {
        const communities = await Community.find().populate("creator", "username email");
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single community
export const getCommunityById = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate("creator", "username email")
            .populate("members", "username email")
            .populate("posts");

        if (!community) return res.status(404).json({ message: "Community not found" });

        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Join a community
export const joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: "Community not found" });

        if (community.members.includes(req.user._id)) {
            return res.status(400).json({ message: "Already a member" });
        }

        community.members.push(req.user._id);
        await community.save();
        res.json({ message: "Joined community successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Leave a community
export const leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: "Community not found" });

        community.members = community.members.filter(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );
        await community.save();
        res.json({ message: "Left community successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a community
export const deleteCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: "Community not found" });

        if (community.creator.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this community" });
        }

        await community.deleteOne();
        res.json({ message: "Community deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
