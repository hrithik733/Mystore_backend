import Category from "../models/Category.js";

// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json("Name is required");

  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json("Category already exists");

  const category = await Category.create({ name });
  res.json(category);
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const updated = await Category.findByIdAndUpdate(id, { name }, { new: true });
  res.json(updated);
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json("Deleted");
};
