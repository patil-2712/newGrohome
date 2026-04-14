"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { FaMapMarkerAlt, FaBox, FaRupeeSign, FaCalendarAlt, FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";
import Image from "next/image";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, userLocation, updateUserLocation } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your orders");
      router.push("/");
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Orders response:", data);

      if (data.success) {
        setOrders(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    await updateUserLocation();
  };

  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch(statusLower) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-purple-100 text-purple-800";
      case "shipped": return "bg-indigo-100 text-indigo-800";
      case "out_for_delivery": return "bg-orange-100 text-orange-800";
      case "delivered": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "returned": return "bg-gray-100 text-gray-800";
      case "open": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
      open: "Processing",
    };
    return statusMap[status?.toLowerCase()] || status || "Pending";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#f8f8f8] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c5f2a] mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f8f8] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Location Indicator */}
        {isAuthenticated && userLocation && (
          <div className="mb-4 flex items-center justify-end gap-2 bg-white/80 rounded-full px-3 py-1.5 text-sm w-fit ml-auto shadow-sm">
            <FaMapMarkerAlt className="text-[#6c6d2c] text-xs" />
            <span className="text-gray-600">Default delivery:</span>
            <span className="font-semibold text-[#6c6d2c]">{userLocation.city}</span>
            <button
              onClick={handleUpdateLocation}
              className="ml-1 text-xs text-[#6c6d2c] hover:underline"
            >
              Change
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black md:text-4xl">My Orders</h1>
          <p className="text-gray-600 mt-2">View and track your order history</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 shadow text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-block rounded-full bg-[#5c5f2a] px-6 py-2.5 text-white font-semibold hover:bg-[#4a4d20] transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="rounded-2xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Order Header */}
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <FaBox className="text-[#5c5f2a] text-xl" />
                      <div>
                        <p className="text-xs text-gray-500">Order Number</p>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <FaCalendarAlt className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Order Date</p>
                        <p className="font-semibold text-gray-900">{formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-bold text-[#5c5f2a] text-xl flex items-center">
                        <FaRupeeSign className="text-sm mr-0.5" />
                        {order.total?.toLocaleString() || 0}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="text-[#5c5f2a] hover:text-[#4a4d20] text-sm font-semibold"
                    >
                      {expandedOrder === order._id ? "View Less ↑" : "View Details ↓"}
                    </button>
                  </div>
                </div>

                {/* Order Items (Always visible summary) */}
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="relative h-10 w-10 rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-gray-500 text-xs">📦</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {/* Order Items Details */}
                    <div className="px-6 py-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Items Details</h3>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-200 last:border-0">
                            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100 flex-shrink-0">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">📦</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900 flex items-center">
                                <FaRupeeSign className="text-xs mr-0.5" />
                                {item.total?.toLocaleString() || (item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                <FaRupeeSign className="text-xs inline mr-0.5" />
                                {item.price} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warehouse Info */}
                    {order.warehouse && (
                      <div className="border-t border-gray-100 bg-blue-50 px-6 py-3">
                        <div className="flex items-center gap-2">
                          <FaTruck className="text-[#6c6d2c] text-xs" />
                          <span className="text-xs text-gray-600">Fulfilled from:</span>
                          <span className="text-xs font-semibold text-gray-800">{order.warehouse.name}</span>
                          {order.warehouse.distance && (
                            <span className="text-xs text-gray-500">({order.warehouse.distance})</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Shipping Address */}
                    {order.customerAddress && (
                      <div className="border-t border-gray-100 bg-white px-6 py-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                          <p>{order.customerAddress.fullName}</p>
                          <p>{order.customerAddress.address}</p>
                          <p>{order.customerAddress.city}, {order.customerAddress.state} - {order.customerAddress.pincode}</p>
                          <p>Phone: {order.customerAddress.phone}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="border-t border-gray-100 bg-white px-6 py-4">
                      <div className="flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment Status</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </span>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <p className="text-xs text-gray-500">Tracking Number</p>
                            <p className="font-semibold text-gray-900">{order.trackingNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Actions */}
                    <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                      <div className="flex gap-3 flex-wrap">
                        {order.orderStatus?.toLowerCase() === "delivered" && (
                          <button
                            onClick={() => toast.info("Review feature coming soon!")}
                            className="px-4 py-2 text-sm font-semibold border border-[#5c5f2a] text-[#5c5f2a] rounded-full hover:bg-[#5c5f2a] hover:text-white transition"
                          >
                            Write a Review
                          </button>
                        )}
                        {order.orderStatus?.toLowerCase() === "pending" && (
                          <button
                            onClick={() => toast.info("Cancel order feature coming soon!")}
                            className="px-4 py-2 text-sm font-semibold border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                          >
                            Cancel Order
                          </button>
                        )}
                        {order.orderStatus?.toLowerCase() === "shipped" && order.trackingNumber && (
                          <button
                            onClick={() => toast.info(`Tracking: ${order.trackingNumber}`)}
                            className="px-4 py-2 text-sm font-semibold border border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition"
                          >
                            Track Order
                          </button>
                        )}
                        <button
                          onClick={() => toast.info("Re-order feature coming soon!")}
                          className="px-4 py-2 text-sm font-semibold bg-[#5c5f2a] text-white rounded-full hover:bg-[#4a4d20] transition"
                        >
                          Re-order
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}