import User from "../models/User.js";
import Order from "../models/Order.js";

export const getUsers = async (req, res) => {
  res.json(await User.find());
};

export const approveSeller = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: "seller", isSellerApproved: true },
    { new: true }
  );

  res.json(user);
};

export const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json("Deleted");
};

export const banUser = async (req, res) => {
  res.json(
    await User.findByIdAndUpdate(req.params.id, { isBanned: true })
  );
};

export const unbanUser = async (req, res) => {
  res.json(
    await User.findByIdAndUpdate(req.params.id, { isBanned: false })
  );
};

export const allOrders = async (req, res) => {
  res.json(await Order.find().populate("user"));
};

export const updateOrder = async (req, res) => {
  res.json(
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    )
  );
};
