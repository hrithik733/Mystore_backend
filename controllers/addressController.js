// backend/controllers/addressController.js
import User from "../models/User.js";

export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id).select("addresses");
  res.json(user?.addresses || []);
};

export const addAddress = async (req, res) => {
  const { name, phone, addressLine, city, state, pincode, landmark, isDefault } = req.body;
  const user = await User.findById(req.user._id);
  const addr = { name, phone, addressLine, city, state, pincode, landmark, isDefault: !!isDefault };
  if (isDefault) user.addresses.forEach(a => (a.isDefault = false));
  user.addresses.push(addr);
  await user.save();
  res.json(user.addresses);
};

export const updateAddress = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const idx = user.addresses.findIndex(a => a._id.toString() === id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  Object.assign(user.addresses[idx], req.body);
  if (req.body.isDefault) user.addresses.forEach((a, i) => (i === idx ? a.isDefault = true : a.isDefault = false));
  await user.save();
  res.json(user.addresses);
};

export const deleteAddress = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(a => a._id.toString() !== id);
  await user.save();
  res.json(user.addresses);
};
