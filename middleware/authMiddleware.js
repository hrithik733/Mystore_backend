import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.query.token;

    if (!token) return res.status(401).json("Not authorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    return res.status(401).json("Not authorized");
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json("Admin only");
  next();
};

export const isSeller = (req, res, next) => {
  if (req.user.role !== "seller")
    return res.status(403).json("Seller only");
  next();
};
