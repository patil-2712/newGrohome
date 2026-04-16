"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
  const [recentSearches, setRecentSearches] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("recent-searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("recent-searches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = (term) => {
    const clean = term.trim();
    if (!clean) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== clean.toLowerCase()
      );
      return [clean, ...filtered].slice(0, 8);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const value = useMemo(
    () => ({ recentSearches, addRecentSearch, clearRecentSearches }),
    [recentSearches]
  );

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchStore() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchStore must be used inside SearchProvider");
  }
  return context;
}