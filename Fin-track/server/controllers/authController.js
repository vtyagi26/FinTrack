import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const emailLower = email.toLowerCase(); // ✅ normalize email

    let user = await User.findOne({ email: emailLower });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({ email: emailLower, password, name });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase(); // ✅ normalize email

    const user = await User.findOne({ email: emailLower });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
