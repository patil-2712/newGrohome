import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, sparse: true },
    phone: { type: String, sparse: true },
    name: { type: String, default: "" },
    roles: { type: [String], default: ["customer"] },
    type: { 
      type: String, 
      enum: ["customer", "company", "admin"], 
      default: "customer" 
    },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

// Remove duplicate indexes - only keep these
UserSchema.index({ phone: 1 }, { unique: true, sparse: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);