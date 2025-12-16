// backend/routes/paymentRoutes.js
import express from "express";
import Stripe from "stripe";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Order from "../models/Order.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ----------------------------------------
// CREATE CHECKOUT SESSION
// ----------------------------------------
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { items, addressId } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "No items found" });
    }

    const line_items = items.map((i) => ({
      price_data: {
        currency: "inr",
        product_data: { name: i.title },
        unit_amount: Math.round(i.price * 100),
      },
      quantity: i.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,

      metadata: {
        userId: req.user._id.toString(),
        addressId: addressId || "",
      },
    });

    return res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe session creation failed:", err);
    return res.status(500).json({ message: "Stripe checkout error" });
  }
});


// ----------------------------------------
// VERIFY PAYMENT + CREATE ORDER (DUPLICATE SAFE)
// ----------------------------------------
router.post("/verify", protect, async (req, res) => {
  try {
    const { sessionId, items, addressId } = req.body;

    if (!sessionId) return res.status(400).json({ message: "Missing session ID" });
    if (!items) return res.status(400).json({ message: "Missing items" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const paymentIntent = session.payment_intent;

    //   DUPLICATE ORDER PROTECTION — VERY IMPORTANT
    const existingOrder = await Order.findOne({ paymentIntentId: paymentIntent });

    if (existingOrder) {
      console.log("⚠️ Duplicate prevented — order already exists");
      return res.json({ success: true, orderId: existingOrder._id });
    }

    // ----------------------------------------------------------------
    // FETCH USER + ADDRESS SNAPSHOT
    // ----------------------------------------------------------------
    const userId = session.metadata.userId;
    const user = await User.findById(userId).select("addresses");

    let addressSnapshot = null;
    const selectedAddress = user.addresses.id(addressId);

    if (selectedAddress) {
      addressSnapshot = {
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        addressLine: selectedAddress.addressLine,
        city: selectedAddress.city,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        landmark: selectedAddress.landmark,
      };
    }

    // Use default address if no selection
    if (!addressSnapshot) {
      const def = user.addresses.find((a) => a.isDefault);
      if (def) {
        addressSnapshot = {
          name: def.name,
          phone: def.phone,
          addressLine: def.addressLine,
          city: def.city,
          state: def.state,
          pincode: def.pincode,
          landmark: def.landmark,
        };
      }
    }

    // ----------------------------------------------------------------
    // MERGE DUPLICATE CART ITEMS (SAFE)
    // ----------------------------------------------------------------
    const mergedMap = new Map();

    for (const i of items) {
      const key = String(i._id);

      if (!mergedMap.has(key)) {
        mergedMap.set(key, {
          product: i._id,
          title: i.title,
          images: i.images || [],
          price: i.price,
          qty: i.qty,
          seller: i.seller || null,
        });
      } else {
        mergedMap.get(key).qty += i.qty;
      }
    }

    const orderItems = Array.from(mergedMap.values());

    const totalAmount = orderItems.reduce(
      (sum, x) => sum + x.price * x.qty,
      0
    );

    // ----------------------------------------------------------------
    // CREATE ORDER
    // ----------------------------------------------------------------
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      status: "processing",
      paymentStatus: "paid",
      paymentIntentId: paymentIntent, // ⭐ required for duplicate prevention
      address: addressSnapshot,
    });

    return res.json({ success: true, orderId: order._id });

  } catch (err) {
    console.error("Order verify error:", err);
    return res.status(500).json({ message: "Order verification failed" });
  }
});

export default router;
