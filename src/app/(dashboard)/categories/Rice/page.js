"use client";

import Image from "next/image";
import React, { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useRouter } from "next/navigation";

const products = [
  {
    id: 1,
    name: "Lachkari Kolam Rice",
    price: 149,
    image: "/kolam.jpg",
    sizes: ["500gm", "1kg", "5kg"],
  },
  {
    id: 2,
    name: "Basmati Rice (Long Grain)",
    price: 149,
    image: "/basmati.jpg",
    sizes: ["500gm", "1kg", "5kg"],
  },
  {
    id: 3,
    name: "Indrayani Rice (Semi-Polished)",
    price: 149,
    image: "/indrayani.jpg",
    sizes: ["500gm", "1kg", "5kg"],
  },
  {
    id: 4,
    name: "Sabudana / Sago / Tapioca Pearls",
    price: 149,
    image: "/sabudana.jpg",
    sizes: ["500gm", "1kg", "5kg"],
  },
];

const BagsPage = () => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const router = useRouter();

  const [openSizeSelector, setOpenSizeSelector] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState({});

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

  return (
    <div className="min-h-screen bg-[#f5f1ea] px-6 py-10">
      <h2 className="mb-10 text-left text-3xl font-bold text-[#1f1f1f]">
        Rice, Pulses, Cereals ({products.length})
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

export default BagsPage;