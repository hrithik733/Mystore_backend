import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";

/* =========================================================
   CREATE ORDER (USED AFTER PAYMENT SUCCESS)
   ========================================================= */
export const createOrder = async (cartItems, userId, address) => {

  // 🔒 STOCK VALIDATION (IMPORTANT)
  for (let item of cartItems) {
    const product = await Product.findById(item._id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < item.qty) {
      throw new Error(`Not enough stock for ${product.title}`);
    }
  }

  // 📦 SNAPSHOT ITEMS (PRICE / TITLE / IMAGE AT PURCHASE TIME)
  const items = cartItems.map((i) => ({
    product: i._id,        // reference
    title: i.title,        // snapshot
    images: i.images,      // snapshot
    qty: i.qty,
    price: i.price,
    seller: i.seller,
  }));

  const totalAmount = items.reduce(
    (sum, i) => sum + i.qty * i.price,
    0
  );

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

/* =========================================================
   SELLER: GET ORDERS RELATED TO OWN PRODUCTS
   ========================================================= */
export const getSellerOrders = async (req, res) => {
  const sellerId = req.user._id;

  const orders = await Order.find({ "items.seller": sellerId })
    .populate("user", "name email")
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  res.json(orders);
};

/* =========================================================
   SELLER: UPDATE ORDER STATUS
   (REDUCE STOCK WHEN DELIVERED)
   ========================================================= */
export const updateSellerOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items.product");

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  // ❌ Prevent double updates after delivery
  if (order.status === "delivered") {
    return res.status(400).json({
      message: "Order already delivered. Cannot update again.",
    });
  }

  // ✅ Reduce stock ONLY when status becomes delivered
  if (req.body.status === "delivered") {
    for (let item of order.items) {
      const product = await Product.findById(item.product._id);

      if (!product) continue;

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}`,
        });
      }

      product.stock -= item.qty;
      await product.save();
    }
  }

  order.status = req.body.status;
  await order.save();

  res.json(order);
};

/* =========================================================
   USER: GET MY ORDERS + REVIEW STATUS
   ========================================================= */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title images price")
      .sort({ createdAt: -1 });

    // ⭐ order-based review tracking
    const reviews = await Review.find({ user: req.user._id }).select(
      "product orderId"
    );

    const reviewedMap = reviews.map((r) => ({
      product: r.product.toString(),
      order: r.orderId.toString(),
    }));

    res.json({
      orders,
      reviewedMap,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load orders" });
  }
};


/* =========================================================
   ADMIN: GET ALL ORDERS
   ========================================================= */
export const getAdminOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "title images price")
    .sort({ createdAt: -1 });

  res.json(orders);
};
