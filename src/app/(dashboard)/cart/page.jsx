"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='100%25' height='100%25' fill='%23f3e6d3'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23999999' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function CartPage() {
  const router = useRouter();
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  // Define increaseQty function
  const increaseQty = (id, selectedSize) => {
    const item = cart.find(i => i.id === id && i.selectedSize === selectedSize);
    if (item) {
      updateQuantity(id, selectedSize, item.quantity + 1);
    }
  };

  // Define decreaseQty function
  const decreaseQty = (id, selectedSize) => {
    const item = cart.find(i => i.id === id && i.selectedSize === selectedSize);
    if (item && item.quantity > 1) {
      updateQuantity(id, selectedSize, item.quantity - 1);
    } else if (item && item.quantity === 1) {
      removeFromCart(id, selectedSize);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to proceed with checkout");
      const event = new CustomEvent("openAccountModal");
      window.dispatchEvent(event);
      return;
    }
    
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    router.push("/checkout");
  };

  if (cart.length === 0) {
    return (
      <section className="min-h-screen bg-[#f8f8f8] px-6 py-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-12 shadow text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link
              href="/products"
              className="inline-block rounded-full bg-[#5c5f2a] px-6 py-2.5 text-white font-semibold hover:bg-[#4a4d20] transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8f8f8] px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black md:text-4xl">Shopping Cart</h1>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#5c5f2a] transition"
          >
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={item.img || PLACEHOLDER_IMAGE}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">Size: {item.selectedSize}</p>
                        {item.warehouseName && (
                          <p className="text-xs text-gray-400">From: {item.warehouseName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#5c5f2a]">₹{item.price}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => decreaseQty(item.id, item.selectedSize)}
                          className="rounded-md border px-3 py-1 text-lg hover:bg-gray-100 transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => increaseQty(item.id, item.selectedSize)}
                          className="rounded-md border px-3 py-1 text-lg hover:bg-gray-100 transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedSize)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white p-6 shadow-sm sticky top-24">
              <h2 className="mb-4 text-xl font-bold text-black">Order Summary</h2>
              
              <div className="space-y-3 border-b pb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{(cartTotal * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#5c5f2a] pt-2 border-t">
                  <span>Total</span>
                  <span>₹{(cartTotal * 1.18).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full rounded-full bg-[#5c5f2a] py-3 text-sm font-semibold text-white transition hover:bg-[#4a4d20] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Proceed to Checkout"}
                </button>
                
                <button
                  onClick={() => router.push("/products")}
                  className="w-full rounded-full border-2 border-[#5c5f2a] py-3 text-sm font-semibold text-[#5c5f2a] transition hover:bg-[#5c5f2a] hover:text-white"
                >
                  Continue Shopping
                </button>
                
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full rounded-full border border-red-300 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}