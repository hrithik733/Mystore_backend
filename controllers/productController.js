import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import Review from "../models/Review.js";

export const getAll = async (req, res) => {
  try {
    const { category, sort, page = 1, limit = 16 } = req.query;

    // Category Filter
    let filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }

    // Sorting
    let sorting = {};
    if (sort === "low") sorting.price = 1;
    if (sort === "high") sorting.price = -1;

    // Fetch products with pagination
    const products = await Product.find(filter)
      .sort(sorting)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getOne = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "user", select: "name" }
    });

  res.json(product);
};


export const createProduct = async (req, res) => {
  const uploadedImages = [];

  for (let file of req.files) {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "products" },
      (error, response) => {}
    );
  }

  const urls = [];

  for (let f of req.files) {
    const upload = await cloudinary.uploader.upload_stream();
  }

  const results = [];
  for (let f of req.files) {
    results.push(
      await cloudinary.uploader.upload(`data:image/jpeg;base64,${f.buffer.toString("base64")}`)
    );
  }

  const images = results.map((r) => r.secure_url);

  const p = await Product.create({
    ...req.body,
    images,
    seller: req.user._id,
  });

  res.json(p);
};

export const updateProduct = async (req, res) => {
  let existing = JSON.parse(req.body.imagesExisting || "[]");

  const uploads = [];

  for (let f of req.files) {
    const r = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${f.buffer.toString("base64")}`
    );
    uploads.push(r.secure_url);
  }

  const images = [...existing, ...uploads];

  const p = await Product.findByIdAndUpdate(
    req.params.id,
    { ...req.body, images },
    { new: true }
  );

  res.json(p);
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ msg: "Deleted" });
};

export const getMyProducts = async (req, res) => {
  const products = await Product.find({ seller: req.user._id });
  res.json(products);
};
export const sellerStockStats = async (req, res) => {
  const sellerId = req.user._id;

  const products = await Product.find({ seller: sellerId });

  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  res.json({
    totalProducts,
    outOfStock,
    lowStock,
  });
};
