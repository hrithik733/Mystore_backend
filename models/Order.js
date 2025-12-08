// backend/models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title: String,
  images: [String],
  price: Number,
  qty: Number,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // useful for seller orders
});

const AddressSnapshotSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,
});

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [OrderItemSchema],
    totalAmount: Number,
    status: { type: String, default: "processing" },
    address: AddressSnapshotSchema,
    paymentIntentId: String,
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
