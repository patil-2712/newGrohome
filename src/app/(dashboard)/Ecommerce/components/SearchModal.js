"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchStore } from "../../context/SearchContext";
import axios from "axios";
import { toast } from "react-toastify";

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useSearchStore();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bestsellers, setBestsellers] = useState([]);

  // Fetch products from API
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let productOrderCount = {};
      
      // Fetch order counts for bestsellers
      try {
        const ordersRes = await axios.get("/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (ordersRes.data.success) {
          const orders = ordersRes.data.data || [];
          
          orders.forEach(order => {
            order.items.forEach(item => {
              const productId = item.productId?._id || item.productId;
              if (productId) {
                productOrderCount[productId] = (productOrderCount[productId] || 0) + item.quantity;
              }
            });
          });
        }
      } catch (orderError) {
        console.log("Could not fetch orders:", orderError);
      }

      // Fetch all products
      const productsRes = await axios.get("/api/items");
      
      if (productsRes.data.success) {
        const items = productsRes.data.data || [];
        
        // Filter only active items
        const activeItems = items.filter(item => item.status === "active");
        
        // Map products for search
        const mappedProducts = activeItems.map(item => ({
          id: item._id,
          name: item.itemName,
          href: `/product/${item._id}`,
          category: item.category,
          categoryHref: item.category ? `/categories/${encodeURIComponent(item.category)}` : null,
          orderCount: productOrderCount[item._id] || 0,
          price: item.unitPrice,
          image: item.imageUrl
        }));
        
        setProducts(mappedProducts);
        
        // Get top 6 bestsellers (most ordered products)
        const sortedByOrders = [...mappedProducts].sort((a, b) => b.orderCount - a.orderCount);
        const topBestsellers = sortedByOrders.slice(0, 6);
        setBestsellers(topBestsellers);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    return products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  const handleSearch = (term, href, isProduct = true) => {
    addRecentSearch(term);
    setQuery("");
    onClose();
    if (isProduct) {
      router.push(href);
    } else {
      router.push(href);
    }
  };

  const handleProductClick = (product) => {
    addRecentSearch(product.name);
    setQuery("");
    onClose();
    router.push(`/product/${product.id}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40" onClick={onClose}>
      <div 
        className="mx-auto mt-20 w-[92%] max-w-2xl rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#6c6d2c] focus:ring-1 focus:ring-[#6c6d2c]"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border px-4 py-3 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>

        {!query.trim() && (
          <div className="mt-6">
            {/* Recent Searches */}
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-gray-800">Recent searches</p>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="text-sm text-gray-500 hover:text-black transition"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.length > 0 ? (
                recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSearch(item, `/search?q=${encodeURIComponent(item)}`, false)}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200 transition"
                  >
                    {item}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent searches</p>
              )}
            </div>

            {/* Bestsellers */}
            <p className="mt-6 mb-3 font-semibold text-gray-800">🔥 Bestsellers</p>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6c6d2c]"></div>
              </div>
            ) : bestsellers.length > 0 ? (
              <div className="space-y-2">
                {bestsellers.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductClick(product)}
                    className="w-full flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition group"
                  >
                    <div>
                      <p className="font-medium text-gray-800 group-hover:text-[#6c6d2c]">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ₹{product.price} • {product.orderCount}+ orders
                      </p>
                    </div>
                    <span className="text-xs text-amber-500">⭐</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products available</p>
            )}

            {/* Browse Categories */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="mb-2 font-semibold text-gray-800">Browse Categories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push("/categories");
                  }}
                  className="rounded-full border border-gray-300 px-3 py-1.5 text-sm hover:border-[#6c6d2c] hover:bg-[#6c6d2c] hover:text-white transition"
                >
                  All Categories
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {query.trim() && (
          <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c6d2c]"></div>
              </div>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductClick(product)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left hover:bg-gray-50 transition group"
                >
                  <p className="font-medium text-gray-800 group-hover:text-[#6c6d2c]">
                    {product.name}
                  </p>
                  {product.category && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Category: {product.category}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-[#6c6d2c] mt-1">
                    ₹{product.price}
                  </p>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}