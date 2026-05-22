import bcrypt from "bcryptjs";
import { clearAuthCookie, setAuthCookie, signToken } from "../lib/jwt.js";
import User from "../models/user.model.js";

function publicUser(user) {
  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt
  };
}

export async function signup(req, res) {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ fullName, email, password: hashedPassword });
    setAuthCookie(res, signToken(user._id));

    res.status(201).json(publicUser(user));
  } catch {
    res.status(500).json({ message: "Could not create account" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setAuthCookie(res, signToken(user._id));
    res.json(publicUser(user));
  } catch {
    res.status(500).json({ message: "Could not log in" });
  }
}

export function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: "Logged out" });
}

export function me(req, res) {
  res.json(publicUser(req.user));
}
