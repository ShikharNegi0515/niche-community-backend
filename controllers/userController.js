import User from "../models/User.js";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { username, email, avatar } = req.body;

        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email is already in use" });
            }
            user.email = email;
        }

        if (username) {
            user.username = username;
        }

        if (avatar !== undefined) {
            user.avatar = avatar; // base64 string or url
        }

        const updatedUser = await user.save();

        res.json({
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatar: updatedUser.avatar || "",
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
