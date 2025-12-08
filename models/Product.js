import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    stock: Number,
    category: String,
    images: [String],

    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
     reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }]
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
