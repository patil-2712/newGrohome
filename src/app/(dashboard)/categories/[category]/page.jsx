"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();
  const params = useParams();
  const categoryName = params.category;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSizeSelector, setOpenSizeSelector] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

  useEffect(() => {
    if (categoryName) {
      fetchCategoryItems();
    }
  }, [categoryName]);

  const fetchCategoryItems = async () => {
  setLoading(true);
  try {
    // Use public endpoint with category filter
    const res = await axios.get(`/api/items?category=${encodeURIComponent(categoryName)}`);
    
    if (res.data.success) {
      const items = res.data.data || [];
      
      // Map items to product format
      const mappedProducts = items.map(item => ({
        id: item._id,
        name: item.itemName,
        price: item.unitPrice,
        image: item.imageUrl || "/placeholder-image.jpg",
        sizes: getSizesFromUOM(item.uom, item.itemType),
        description: item.description,
        category: item.category,
        itemType: item.itemType
      }));
      
      setProducts(mappedProducts);
    }
  } catch (error) {
    console.error("Error fetching category items:", error);
    toast.error("Failed to load items");
  } finally {
    setLoading(false);
  }
};

  // Helper function to generate sizes based on UOM and item type
  const getSizesFromUOM = (uom, itemType) => {
    if (itemType === "Service") {
      return ["Basic", "Standard", "Premium", "Enterprise"];
    }
    
    if (itemType === "Raw Material") {
      const sizeMap = {
        "KG": ["1kg", "5kg", "10kg", "25kg", "50kg"],
        "MTP": ["1MT", "5MT", "10MT", "25MT"],
        "PC": ["10pcs", "25pcs", "50pcs", "100pcs"],
        "LTR": ["1L", "5L", "10L", "20L", "50L"],
        "MTR": ["10m", "25m", "50m", "100m"]
      };
      return sizeMap[uom] || ["1kg", "5kg", "10kg", "25kg"];
    }
    
    const sizeMap = {
      "KG": ["250gm", "500gm", "1kg", "2kg"],
      "MTP": ["1kg", "5kg", "10kg", "25kg"],
      "PC": ["1pc", "2pc", "5pc", "10pc"],
      "LTR": ["250ml", "500ml", "1L", "2L"],
      "MTR": ["1m", "2m", "5m", "10m"]
    };
    return sizeMap[uom] || ["250gm", "500gm", "1kg"];
  };

  const handleOpenSizes = (productId) => {
    setOpenSizeSelector(productId);
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]:
        prev[productId] ||
        products.find((p) => p.id === productId)?.sizes[0],
    }));
  };

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const handleConfirmAddToCart = (product) => {
    const finalSize = selectedSizes[product.id] || product.sizes[0];

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.image,
      quantity: 1,
      selectedSize: finalSize,
    });

    setOpenSizeSelector(null);
    router.push("/cart");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f1ea] px-6 py-10">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c5f2a] mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  // No products available
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f1ea] px-6 py-10">
        <h2 className="mb-10 text-left text-3xl font-bold text-[#1f1f1f]">
          {categoryName || "Category"} ({products.length})
        </h2>
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600 text-lg">No items found in this category.</p>
          <p className="text-gray-500 mt-2">Please check back later for our offerings!</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-[#5c5f2a] text-white rounded-full hover:bg-[#4a4d20] transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] px-6 py-10">
      <h2 className="mb-10 text-left text-3xl font-bold text-[#1f1f1f]">
        {categoryName} ({products.length})
      </h2>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
          const isFav = isInWishlist(product.id);
          const isOpen = openSizeSelector === product.id;
          const activeSize = selectedSizes[product.id] || product.sizes[0];

          return (
            <div
              key={product.id}
              className="rounded-2xl bg-white p-4 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="relative h-56 overflow-hidden rounded-xl bg-[#f3e6d3]">
                <button
                  type="button"
                  onClick={() => {
                    toggleWishlist({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      img: product.image,
                    });
                    router.push("/favourites");
                  }}
                  className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow transition ${
                    isFav
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-500 hover:text-red-500"
                  }`}
                >
                  <FaHeart />
                </button>

                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>

              <div className="mt-4">
                <h3 className="line-clamp-2 text-[28px] font-semibold text-[#1f1f1f]">
                  {product.name}
                </h3>

                <p className="mt-2 text-lg font-bold text-[#6b7340]">
                  ₹{product.price}
                </p>

                {!isOpen ? (
                  <button
                    type="button"
                    onClick={() => handleOpenSizes(product.id)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#5c5f2a] py-3 text-sm font-semibold text-white transition hover:bg-[#4a4d20]"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="mt-4 rounded-2xl border border-[#e8dfd1] bg-[#faf7f2] p-4">
                    <p className="mb-3 text-sm font-semibold text-[#3d3d3d]">
                      Select size
                    </p>

                    <div className="flex flex-wrap justify-center gap-2">
                      {product.sizes.map((size) => {
                        const isSelected = activeSize === size;

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleSizeSelect(product.id, size)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              isSelected
                                ? "bg-[#5c5f2a] text-white"
                                : "border border-[#d8d1c4] bg-white text-[#333]"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenSizeSelector(null)}
                        className="w-1/2 rounded-full border border-[#d8d1c4] bg-white px-4 py-2 text-sm font-medium text-[#333] transition hover:bg-[#f3efe8]"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmAddToCart(product)}
                        className="w-1/2 rounded-full bg-[#5c5f2a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a4d20]"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryPage;