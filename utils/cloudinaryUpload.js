// backend/controllers/productController.js
import Product from "../models/Product.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

/**
 * Create product (seller only)
 * Accepts multipart/form-data with files named `images`
 */
export const createProduct = async (req, res) => {
  try {
    const { title, description = "", price, stock = 0, category = "general" } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: "Title & price required" });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      // upload all files to cloudinary (serial or parallel)
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer));
      imageUrls = await Promise.all(uploads);
    }

    const product = await Product.create({
      title,
      description,
      price,
      images: imageUrls,
      category,
      stock,
      seller: req.user._id,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    // Optionally add pagination/filtering later
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.json(prod);
  } catch (err) {
    console.error("Get product by id error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get seller products error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ message: "Not found" });

    // Ensure the seller owns the product
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { title, description, price, stock, category } = req.body;

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;

    // If new files uploaded, upload them and append to images array
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((f) => uploadToCloudinary(f.buffer));
      const newUrls = await Promise.all(uploads);
      product.images = product.images.concat(newUrls);
    }

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const pid = req.params.id;
    const product = await Product.findById(pid);
    if (!product) return res.status(404).json({ message: "Not found" });

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
