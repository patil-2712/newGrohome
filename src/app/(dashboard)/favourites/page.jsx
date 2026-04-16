"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaTrash, FaHeart, FaMapMarkerAlt } from "react-icons/fa";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function FavouritesPage() {
  const router = useRouter();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated, userLocation, updateUserLocation } = useAuth();
  const [nearestWarehouse, setNearestWarehouse] = useState(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to view your wishlist");
      router.push("/");
      setLoading(false);
    } else if (userLocation) {
      fetchNearestWarehouse();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router, userLocation]);

  const fetchNearestWarehouse = async () => {
    if (!userLocation?.lat || !userLocation?.lng) {
      setLoading(false);
      return;
    }
    
    setUsingLocation(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/products/location-based", {
        params: { 
          city: userLocation.city, 
          lat: userLocation.lat, 
          lng: userLocation.lng 
        },
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      
      if (res.data.success) {
        setNearestWarehouse(res.data.nearestWarehouse);
      }
    } catch (error) {
      console.error("Error fetching warehouse:", error);
    } finally {
      setLoading(false);
      setUsingLocation(false);
    }
  };

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.productId,
      name: item.name,
      price: item.price,
      img: item.img,
      quantity: 1,
      selectedSize: "250gm",
    };
    addToCart(cartItem);
    toast.success("Added to cart");
  };

  const handleUpdateLocation = async () => {
    const newLocation = await updateUserLocation();
    if (newLocation) {
      fetchNearestWarehouse();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c5f2a]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold mb-2">Login Required</h2>
          <p className="text-gray-600 mb-4">Please login to view your wishlist</p>
          <button
            onClick={() => {
              const event = new CustomEvent("openAccountModal");
              window.dispatchEvent(event);
            }}
            className="bg-[#5c5f2a] text-white px-6 py-2 rounded-full"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h1>
          <p className="text-gray-600 mb-6">Start adding items you love to your wishlist!</p>
          <Link
            href="/"
            className="inline-block bg-[#5c5f2a] text-white px-6 py-3 rounded-full hover:bg-[#4a4d20] transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Location Indicator - Only for logged in users */}
        {isAuthenticated && nearestWarehouse && (
          <div className="mb-4 flex items-center justify-end gap-2 bg-white/80 rounded-full px-3 py-1.5 text-sm w-fit ml-auto">
            <FaMapMarkerAlt className="text-[#6c6d2c] text-xs" />
            <span className="text-gray-600">Serving from:</span>
            <span className="font-semibold text-[#6c6d2c]">{nearestWarehouse.name}</span>
            <span className="text-gray-400 text-xs">({nearestWarehouse.distance})</span>
            <button
              onClick={handleUpdateLocation}
              className="ml-1 text-xs text-[#6c6d2c] hover:underline"
            >
              Change
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold text-black mb-2">My Wishlist</h1>
        <p className="text-gray-600 mb-8">{wishlistItems.length} items</p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {wishlistItems.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition relative"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={item.img || "/placeholder-image.jpg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
                <button
                  onClick={() => toggleWishlist({
                    id: item.productId,
                    name: item.name,
                    price: item.price,
                    img: item.img,
                  })}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-red-50 transition"
                >
                  <FaHeart className="text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                <p className="text-[#5c5f2a] font-bold mt-2">₹{item.price}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 bg-[#5c5f2a] text-white py-2 rounded-full text-sm font-semibold hover:bg-[#4a4d20] transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist({
                      id: item.productId,
                      name: item.name,
                      price: item.price,
                      img: item.img,
                    })}
                    className="px-3 py-2 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}