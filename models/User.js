import mongoose from "mongoose";

// ⭐ Address Schema (add this at top)
const AddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,
  isDefault: { type: Boolean, default: false },
});

// ⭐ Extend your existing user schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,

    role: { type: String, default: "user" }, // user | seller | admin

    isSellerApproved: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },

    // ⭐ ADD THIS FIELD
    addresses: [AddressSchema],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
