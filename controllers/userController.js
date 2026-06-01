import User from "../models/User.js";

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar: user.avatar || "",
});

export const getProfile = async (req, res) => {
  res.json(formatUser(req.user));
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { username, email, avatar } = req.body;

  if (email && email.trim().toLowerCase() !== user.email) {
    const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    user.email = email.trim().toLowerCase();
  }

  if (username?.trim()) {
    const taken = await User.findOne({
      username: username.trim(),
      _id: { $ne: user._id },
    });
    if (taken) {
      return res.status(400).json({ message: "Username already taken" });
    }
    user.username = username.trim();
  }

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await user.save();
  res.json(formatUser(user));
};
