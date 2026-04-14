import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        img: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Index for faster queries
WishlistSchema.index({ userId: 1 });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);