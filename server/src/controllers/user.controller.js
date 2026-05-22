import User from "../models/user.model.js";

export async function getUsersForSidebar(req, res) {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ fullName: 1 });

    res.json(users);
  } catch {
    res.status(500).json({ message: "Could not load users" });
  }
}
