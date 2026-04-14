import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import SalesOrder from '@/models/SalesOrder';
import { getTokenFromHeader, verifyJWT } from '@/lib/auth';
import Counter from '@/models/Counter';

export async function POST(req) {
  await dbConnect();
  
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJWT(token);
    console.log("Customer placing order:", { id: user.id, type: user.type });
    
    // Only allow customers
    if (user.type !== "customer") {
      return NextResponse.json({ success: false, message: "This endpoint is for customers only" }, { status: 403 });
    }

    const orderData = await req.json();
    
    // Validate companyId is present
    if (!orderData.companyId) {
      return NextResponse.json({ 
        success: false, 
        message: "Company ID is required. Please select products from a valid warehouse." 
      }, { status: 400 });
    }
    
    // Clean up data
    delete orderData._id;
    orderData.items?.forEach(i => delete i._id);
    delete orderData.billingAddress?._id;
    delete orderData.shippingAddress?._id;
    
    // Set customer data
    orderData.createdBy = user.id;
    orderData.customer = user.id;
    orderData.customerCode = `CUST-${user.phone}`;
    orderData.customerName = orderData.customerName || user.name || `User ${user.phone.slice(-4)}`;
    orderData.status = "Pending";
    
    // Generate document number for customer order
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    let fyStart = currentYear;
    let fyEnd = currentYear + 1;
    if (currentMonth < 4) {
      fyStart = currentYear - 1;
      fyEnd = currentYear;
    }
    const financialYear = `${fyStart}-${String(fyEnd).slice(-2)}`;
    const key = `CustomerOrder_${orderData.companyId}`;
    
    let counter = await Counter.findOne({ id: key, companyId: orderData.companyId });
    if (!counter) {
      const [created] = await Counter.create([{ id: key, companyId: orderData.companyId, seq: 1 }]);
      counter = created;
    } else {
      counter.seq += 1;
      await counter.save();
    }
    
    const paddedSeq = String(counter.seq).padStart(5, "0");
    orderData.documentNumberOrder = `CUST-ORD/${financialYear}/${paddedSeq}`;
    orderData.salesNumber = `CUST-${financialYear}-${paddedSeq}`;
    
    // Create order
    const order = await SalesOrder.create(orderData);
    
    console.log("Order created successfully:", { id: order._id, companyId: order.companyId });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order placed successfully', 
      order: {
        _id: order._id,
        documentNumberOrder: order.documentNumberOrder,
        grandTotal: order.grandTotal,
        status: order.status
      }
    }, { status: 201 });
    
  } catch (err) {
    console.error("❌ Error creating order:", err.message);
    const code = /Unauthorized|JWT/.test(err.message) ? 401 : 500;
    return NextResponse.json({ success: false, message: err.message }, { status: code });
  }
}

// GET endpoint for customers to view their orders
export async function GET(req) {
  await dbConnect();
  
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = verifyJWT(token);
    
    // Allow customers to view their own orders
    if (user.type !== "customer") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    
    if (orderId) {
      const order = await SalesOrder.findOne({ 
        _id: orderId, 
        createdBy: user.id 
      }).lean();
      
      if (!order) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
      }
      
      const transformedOrder = transformOrderForFrontend(order);
      return NextResponse.json({ success: true, data: transformedOrder });
    }
    
    const orders = await SalesOrder.find({ createdBy: user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    const transformedOrders = orders.map(order => transformOrderForFrontend(order));
    
    return NextResponse.json({ success: true, data: transformedOrders });
    
  } catch (err) {
    console.error("❌ Error fetching orders:", err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// Helper function to transform order data for frontend
function transformOrderForFrontend(order) {
  return {
    _id: order._id,
    orderNumber: order.documentNumberOrder || order.salesNumber || order._id,
    orderDate: order.orderDate || order.createdAt,
    total: order.grandTotal || 0,
    orderStatus: order.status || "pending",
    paymentMethod: order.paymentMethod || "cod",
    paymentStatus: order.paymentStatus || "pending",
    trackingNumber: order.trackingNumber || null,
    warehouse: order.nearestWarehouse || null,
    customerAddress: {
      fullName: order.customerName || "",
      address: order.shippingAddress?.address1 || "",
      city: order.shippingAddress?.city || "",
      state: order.shippingAddress?.state || "",
      pincode: order.shippingAddress?.zip || "",
      phone: order.contactPerson || ""
    },
    items: (order.items || []).map(item => ({
      id: item.item?._id || item.item,
      name: item.itemName || "",
      price: item.unitPrice || 0,
      quantity: item.quantity || 0,
      selectedSize: item.uom || item.selectedSize || "unit",
      image: item.image || null,
      total: item.totalAmount || (item.unitPrice * item.quantity)
    }))
  };
}