"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

// Single placeholder image that exists
const PLACEHOLDER_IMAGE = "/placeholder.png";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nearestWarehouse, setNearestWarehouse] = useState(null);
  const [usingLocation, setUsingLocation] = useState(false);
  const { isAuthenticated, userLocation, updateUserLocation } = useAuth();

  useEffect(() => {
    // ONLY show categories if user is logged in
    if (!isAuthenticated) {
      setLoading(false);
      setCategories([]);
      return;
    }
    
    if (userLocation) {
      fetchCategoriesByLocation();
    } else if (!userLocation) {
      handleUpdateLocation();
    }
  }, [isAuthenticated, userLocation]);

  const handleUpdateLocation = async () => {
    const newLocation = await updateUserLocation();
    if (newLocation) {
      fetchCategoriesByLocation(newLocation);
    } else {
      setLoading(false);
      toast.error("Please enable location to see available products");
    }
  };

  // Helper function to get the best/starting price for an item
  const getItemPrice = (item) => {
    if (item.enableVariants && item.variants && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      if (firstVariant.discount && firstVariant.discount > 0) {
        return firstVariant.price * (1 - firstVariant.discount / 100);
      }
      return firstVariant.price;
    }
    
    if (item.discount && item.discount > 0) {
      return item.unitPrice * (1 - item.discount / 100);
    }
    
    return item.unitPrice;
  };

  const getItemDiscount = (item) => {
    if (item.enableVariants && item.variants && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      return firstVariant.discount || 0;
    }
    return item.discount || 0;
  };

  const hasItemDiscount = (item) => {
    if (item.enableVariants && item.variants && item.variants.length > 0) {
      return item.variants.some(variant => variant.discount && variant.discount > 0);
    }
    return item.discount && item.discount > 0;
  };

  const getVariantName = (item) => {
    if (item.enableVariants && item.variants && item.variants.length > 0) {
      const firstVariant = item.variants[0];
      if (firstVariant.name) return firstVariant.name;
      if (firstVariant.quantity) {
        const uom = item.uom || "unit";
        if (uom === "KG") {
          return firstVariant.quantity >= 1000 
            ? `${firstVariant.quantity/1000}kg` 
            : `${firstVariant.quantity}gm`;
        }
        if (uom === "LTR") {
          return firstVariant.quantity >= 1000 
            ? `${firstVariant.quantity/1000}L` 
            : `${firstVariant.quantity}ml`;
        }
        return `${firstVariant.quantity} ${uom}`;
      }
      return "Variant";
    }
    return null;
  };

  // Fetch categories from nearest warehouse ONLY (items with stock from GRN)
  const fetchCategoriesByLocation = async (location = userLocation) => {
    setLoading(true);
    setUsingLocation(true);
    setNearestWarehouse(null);
    
    try {
      const token = localStorage.getItem("token");
      const lat = location?.lat;
      const lng = location?.lng;
      const city = location?.city || "Unknown";
      
      if (!lat || !lng) {
        setCategories([]);
        setLoading(false);
        toast.error("Unable to detect your location");
        return;
      }
      
      const res = await axios.get("/api/products/location-based", {
        params: { city, lat, lng },
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        },
        timeout: 15000
      });
      
      if (res.data && res.data.success) {
        const items = res.data.data || [];
        setNearestWarehouse(res.data.nearestWarehouse);
        
        // ONLY items with stock (totalStock > 0) from nearest warehouse
        const itemsWithStock = items.filter(item => 
          item.status === "active" && 
          item.category && 
          item.category.trim() !== "" &&
          item.totalStock > 0  // ✅ Only items with stock from GRN
        );
        
        // Group items by category
        const categoryMap = new Map();
        
        itemsWithStock.forEach(item => {
          const categoryName = item.category;
          const itemPrice = getItemPrice(item);
          const itemDiscount = getItemDiscount(item);
          const hasDiscount = hasItemDiscount(item);
          const variantName = getVariantName(item);
          
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              name: categoryName,
              href: `/categories/${encodeURIComponent(categoryName)}`,
              image: item.imageUrl || PLACEHOLDER_IMAGE,
              itemCount: 1,
              representativeItem: item,
              price: itemPrice,
              hasDiscount: hasDiscount,
              discountPercent: itemDiscount,
              variantName: variantName,
              bestDiscount: itemDiscount,
              nearestDistance: res.data.nearestWarehouse?.distance
            });
          } else {
            const existing = categoryMap.get(categoryName);
            categoryMap.set(categoryName, {
              ...existing,
              itemCount: existing.itemCount + 1,
              bestDiscount: Math.max(existing.bestDiscount || 0, itemDiscount)
            });
          }
        });
        
        const categoriesArray = Array.from(categoryMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );
        
        setCategories(categoriesArray);
        
        if (categoriesArray.length === 0) {
          toast.info(`No products available at ${res.data.nearestWarehouse?.name || 'nearest warehouse'}`);
        } else if (res.data.nearestWarehouse) {
          toast.success(`Showing ${categoriesArray.length} categories from ${res.data.nearestWarehouse.name}`);
        }
      } else {
        setCategories([]);
        toast.info("No products available in your area");
      }
    } catch (error) {
      console.error("Error fetching categories by location:", error);
      toast.error("Could not fetch categories for your location");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Not logged in - show login required message
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-[#f5f1ea] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-center text-4xl font-extrabold text-[#1f1f1f] md:text-5xl">
            Our Categories
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600">
            Login to see products available near you
          </p>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔒</div>
            <p className="text-gray-600 text-lg mb-4">Please login to view available products</p>
            <button
              onClick={() => {
                const event = new CustomEvent("openAccountModal");
                window.dispatchEvent(event);
              }}
              className="px-6 py-2 rounded-full bg-[#5c5f2a] text-white hover:bg-[#4a4d20] transition"
            >
              Login Now
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen bg-[#f5f1ea] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-center text-4xl font-extrabold text-[#1f1f1f] md:text-5xl">
            Our Categories
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600">
            Explore products available near you
          </p>
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5c5f2a] mb-4"></div>
            <p className="text-gray-600">Finding products available near you...</p>
          </div>
        </div>
      </section>
    );
  }

  // No categories found
  if (categories.length === 0) {
    return (
      <section className="min-h-screen bg-[#f5f1ea] px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-4 text-center text-4xl font-extrabold text-[#1f1f1f] md:text-5xl">
            Our Categories
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600">
            Explore products available near you
          </p>
          
          {/* Location Indicator */}
          {nearestWarehouse && (
            <div className="mb-6 flex items-center justify-center gap-2 bg-white/80 rounded-full px-3 py-1.5 text-sm w-fit mx-auto">
              <FaMapMarkerAlt className="text-[#6c6d2c] text-xs" />
              <span className="text-gray-600">Serving from:</span>
              <span className="font-semibold text-[#6c6d2c]">{nearestWarehouse.name}</span>
              <span className="text-gray-400 text-xs">({nearestWarehouse.distance})</span>
            </div>
          )}
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-600 text-lg">
              No products available at {nearestWarehouse?.name || 'your nearest warehouse'}.
            </p>
            <p className="text-gray-500 mt-2">
              Please check back later when products are added to inventory.
            </p>
            <button
              onClick={handleUpdateLocation}
              className="mt-6 px-6 py-2 rounded-full bg-[#5c5f2a] text-white hover:bg-[#4a4d20] transition flex items-center gap-2 mx-auto"
            >
              <FaMapMarkerAlt className="text-sm" />
              Try Different Location
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f1ea] px-6 py-14">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <h1 className="mb-4 text-center text-4xl font-extrabold text-[#1f1f1f] md:text-5xl">
          Our Categories
        </h1>

        <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-gray-600">
          Products available at {nearestWarehouse?.name || 'your nearest warehouse'}
        </p>

        {/* Location Indicator */}
        {nearestWarehouse && (
          <div className="mb-6 flex items-center justify-center gap-2 bg-white/80 rounded-full px-3 py-1.5 text-sm w-fit mx-auto">
            <FaMapMarkerAlt className="text-[#6c6d2c] text-xs" />
            <span className="text-gray-600">Serving from:</span>
            <span className="font-semibold text-[#6c6d2c]">{nearestWarehouse.name}</span>
            <span className="text-gray-400 text-xs">({nearestWarehouse.distance})</span>
            <button
              onClick={handleUpdateLocation}
              className="ml-2 text-xs text-[#6c6d2c] hover:underline"
            >
              Change
            </button>
          </div>
        )}

        {/* Grid - Shows ONLY categories with items that have stock in warehouse */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md relative"
            >
              {/* Discount Badge for Category */}
              {category.bestDiscount > 0 && (
                <div className="absolute top-6 right-6 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {category.bestDiscount}% OFF
                </div>
              )}
              
              {/* Distance Badge */}
              {category.nearestDistance && (
                <div className="absolute bottom-24 left-4 z-10 bg-black/70 text-white text-[9px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaMapMarkerAlt className="text-[8px]" />
                  {category.nearestDistance} away
                </div>
              )}
              
              {/* Image */}
              <div className="relative h-52 w-full overflow-hidden rounded-xl bg-[#f3e6d3]">
                {category.image && category.image !== PLACEHOLDER_IMAGE ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400 text-sm">No Image</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="mt-4 text-center">
                <h2 className="text-lg font-semibold text-[#1f1f1f]">
                  {category.name}
                </h2>

                <p className="mt-2 text-sm text-green-600 font-medium">
                  {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'} in stock
                </p>
                
                {/* Show single price */}
                <div className="mt-2">
                  <p className="text-xl font-bold text-[#6b7340]">
                    ₹{category.price.toFixed(2)}
                  </p>
                  {category.variantName && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Starting from {category.variantName}
                    </p>
                  )}
                  {category.hasDiscount && (
                    <p className="text-xs text-green-600 font-semibold mt-0.5">
                      {category.discountPercent}% OFF
                    </p>
                  )}
                </div>

                {/* Button */}
                <span className="mt-4 inline-block w-full rounded-full bg-[#5c5f2a] py-2 text-sm font-semibold text-white transition group-hover:bg-[#4a4d20]">
                  View Category →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Refresh Location Button */}
        <div className="mt-10 text-center">
          <button
            onClick={handleUpdateLocation}
            className="px-6 py-2 rounded-full border-2 border-[#5c5f2a] text-[#5c5f2a] hover:bg-[#5c5f2a] hover:text-white transition flex items-center gap-2 mx-auto"
          >
            <FaMapMarkerAlt className="text-sm" />
            Refresh Location
          </button>
        </div>
      </div>
    </section>
  );
}