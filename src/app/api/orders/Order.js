import mongoose from "mongoose";

// Order Item Schema
const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  selectedSize: { type: String, required: true },
  image: { type: String },
}, { _id: true });

// Address Schema
const AddressSchema = new mongoose.Schema({
  fullName: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  phone: { type: String },
}, { _id: false });

// Order Schema
const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { 
      type: String,
      unique: true,
      sparse: true,  // IMPORTANT: Allows multiple null values
      index: true
    },
    
    // Customer Information
    customerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
    },
    customerEmail: { type: String, required: true, lowercase: true },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerAddress: { type: AddressSchema, default: {} },
    
    // Order Items
    items: [OrderItemSchema],
    
    // Pricing
    subtotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    
    // Payment Details
    paymentMethod: { type: String, enum: ["cod", "online", "upi"], default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentId: { type: String },
    paymentDetails: { type: mongoose.Schema.Types.Mixed },
    
    // Order Status
    orderStatus: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"], default: "pending" },
    
    // Shipping & Tracking
    trackingNumber: { type: String },
    trackingCompany: { type: String },
    expectedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    
    // Order Notes
    notes: { type: String },
    adminNotes: { type: String },
    
    // Timestamps
    orderDate: { type: Date, default: Date.now },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ],
    
    // Cancellation/Return
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    returnedAt: { type: Date },
    returnReason: { type: String },
  },
  { timestamps: true }
);

// Generate order number before validation
OrderSchema.pre("validate", async function(next) {
  // Only generate if orderNumber is not already set
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const startOfDay = new Date(year, month - 1, day);
    const endOfDay = new Date(year, month - 1, day + 1);
    
    const Order = mongoose.model('Order');
    const count = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Add status to history when orderStatus changes
OrderSchema.pre("save", function(next) {
  if (this.isModified("orderStatus") && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
    });
  }
  next();
});

// Create indexes
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });

// Prevent duplicate index issues in development
OrderSchema.set('autoIndex', process.env.NODE_ENV !== 'production');

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);