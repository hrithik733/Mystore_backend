import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ msg: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "user",
      isSellerApproved: role === "seller" ? false : undefined,
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json("Invalid");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json("Invalid");

  if (user.isBanned)
    return res.status(403).json("User is banned");

  if (user.role === "seller" && !user.isSellerApproved)
    return res.status(403).json("Seller not approved yet");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.json({ token, user });
};
