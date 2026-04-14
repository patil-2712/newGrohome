"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated, user]);

  const fetchWishlist = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.warn("No token found for wishlist fetch");
        setWishlistItems([]);
        return;
      }
      
      // REMOVED TIMEOUT - let it complete naturally
      const response = await axios.get("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWishlistItems(response.data.data || []);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.log("Session expired or invalid token");
        // Clear invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Don't show toast to user, just silently fail
        setWishlistItems([]);
      } else if (error.response?.status !== 401) {
        // Only show toast for non-auth errors
        toast.error("Failed to load wishlist");
        setWishlistItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      const event = new CustomEvent("openAccountModal");
      window.dispatchEvent(event);
      return false;
    }

    const isInWishlist = wishlistItems.some(
      (item) => item.productId === product.id
    );

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Session expired. Please login again.");
        const event = new CustomEvent("openAccountModal");
        window.dispatchEvent(event);
        return false;
      }

      if (isInWishlist) {
        await axios.delete(`/api/wishlist?productId=${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(wishlistItems.filter((item) => item.productId !== product.id));
        toast.success("Removed from wishlist");
        return false;
      } else {
        const response = await axios.post(
          "/api/wishlist",
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            img: product.img,
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data.success) {
          setWishlistItems(response.data.data);
          toast.success("Added to wishlist");
          return true;
        }
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const event = new CustomEvent("openAccountModal");
        window.dispatchEvent(event);
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);