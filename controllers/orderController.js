import Order from "../models/Order.js";
import Product from "../models/Product.js";


// ---------------- CREATE ORDER ----------------
export const createOrder = async (cartItems, userId, address) => {

  const items = cartItems.map((i) => ({
    product: i._id,                // Product reference
    title: i.title,                // ⭐ Snapshot title
    images: i.images,              // ⭐ Snapshot images
    qty: i.qty,
    price: i.price,
    seller: i.seller,
  }));

  const totalAmount = items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const order = await Order.create({
    user: userId,
    items,
    totalAmount,
    address,
    status: "processing",
    paymentStatus: "paid",
  });

  return order;
};


// ---------------- SELLER ORDERS ----------------
// Improved version
export const getSellerOrders = async (req, res) => {
  const sellerId = req.user._id;

  const orders = await Order.find({ "items.seller": sellerId })
    .populate("user", "name email")
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ---------------- UPDATE SELLER ORDER STATUS ----------------
export const updateSellerOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order.status === "delivered") {
    return res.status(400).json({ message: "Cannot update after delivered" });
  }

  order.status = req.body.status;
  await order.save();

  res.json(order);
};




// ---------------- USER ORDERS ----------------
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders" });
  }
};

// ---------------- ADMIN ORDERS ----------------
export const getAdminOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  res.json(orders);
};
