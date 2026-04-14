"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { FaMagnifyingGlass, FaRegHeart } from "react-icons/fa6";
import { IoCartOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { useCart } from "../../context/CartContext";
import SearchModal from "./SearchModal";
import AccountModal from "./AccountModal";
import axios from "axios";
import { toast } from "react-toastify";

const navItems = [
  { label: "Sweets & Savouries", href: "/categories/Sweets" },
  { label: "Kokan Special ", href: "/categories/Kokan" },
  { label: "Spices / Masales", href: "/categories/Spices" },
  { label: "Freshly Milled Flours", href: "/categories/Flours" },
  { label: "Rice, Pulses, Cereals", href: "/categories/Rice" },
  { label: "Lonche / Pickles", href: "/categories/pickles" },
  { label: "Sandge & Chutneys", href: "/categories/Chutneys" },
  { label: "Papad, Sevai", href: "/categories/Papad" },
  { label: "Gallery", href: "/categories/Gallery" },
  { label: "About", href: "/About" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCustomersOpen, setIsCustomersOpen] = useState(false);
  const { cartCount } = useCart();

  // Listen for custom event to open account modal from other components
  useEffect(() => {
    const handleOpenAccountModal = () => {
      setIsAccountOpen(true);
    };
    
    window.addEventListener("openAccountModal", handleOpenAccountModal);
    
    return () => {
      window.removeEventListener("openAccountModal", handleOpenAccountModal);
    };
  }, []);

  // Fetch categories from items
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/items");
      
      if (res.data.success) {
        const items = res.data.data || [];
        
        // Get unique categories from active items
        const uniqueCategories = [...new Set(
          items
            .filter(item => item.status === "active" && item.category)
            .map(item => item.category)
        )];
        
        uniqueCategories.sort();
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false);
    setIsCategoriesOpen(false);
    setIsCustomersOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-[#e7e0d6] bg-[#f5f1ea]">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[70px] md:h-[86px] items-center">
            {/* Logo */}
            <Link
              href="/"
              className="flex shrink-0 items-center transition-transform duration-200 hover:scale-105"
            >
              <Image
                src="/gruhamlogo.jpg"
                alt="Gruham Logo"
                width={200}
                height={70}
                quality={100}
                priority
                className="h-[55px] md:h-[70px] w-auto object-contain"
              />
            </Link>

            {/* Center Nav - Desktop */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="flex items-center gap-6 lg:gap-10">
                <Link
                  href="/"
                  className="whitespace-nowrap text-[16px] lg:text-[18px] font-semibold text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d]"
                >
                  Home
                </Link>

                <div className="group relative">
                  <Link
                    href="/categories"
                    className="flex items-center gap-1 whitespace-nowrap text-[16px] lg:text-[18px] font-semibold text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d]"
                  >
                    <span>Shop by Category</span>
                    <FaChevronDown className="text-[10px] mt-[2px]" />
                  </Link>

                  {/* Desktop Dropdown */}
                  <div className="invisible absolute left-0 top-full z-50 pt-5 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-[250px] bg-[#f5f1ea] border border-[#e7e0d6] rounded-lg shadow-lg p-2">
                      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                        {categories.length > 0 ? (
                          categories.map((category) => (
                            <Link
                              key={category}
                              href={`/categories/${encodeURIComponent(category)}`}
                              className="whitespace-nowrap text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                            >
                              {category}
                            </Link>
                          ))
                        ) : (
                          navItems.slice(0, 8).map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="whitespace-nowrap text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                            >
                              {item.label}
                            </Link>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  href="/bestsellers"
                  className="whitespace-nowrap text-[16px] lg:text-[18px] font-semibold text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d]"
                >
                  Bestsellers
                </Link>

                <Link
                  href="/About"
                  className="whitespace-nowrap text-[16px] lg:text-[18px] font-semibold text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d]"
                >
                  About Us
                </Link>

                <div className="group relative">
                  <Link
                    href="/contact"
                    className="flex items-center gap-1 whitespace-nowrap text-[16px] lg:text-[18px] font-semibold text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d]"
                  >
                    <span>Customers</span>
                    <FaChevronDown className="text-[10px] mt-[2px]" />
                  </Link>

                  {/* Desktop Dropdown */}
                  <div className="invisible absolute left-0 top-full z-50 pt-5 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="min-w-[280px] bg-[#f5f1ea] border border-[#e7e0d6] rounded-lg shadow-lg p-2">
                      <div className="flex flex-col gap-2">
                        <Link
                          href="/orders"
                          className="text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/contact"
                          className="text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="/refund-policy"
                          className="text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                        >
                          Refund & Cancellation Policy
                        </Link>
                        <Link
                          href="/privacy-policy"
                          className="text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                        >
                          Privacy Policy
                        </Link>
                        <Link
                          href="/terms-conditions"
                          className="text-[14px] font-medium text-[#1f1f1f] px-3 py-2 rounded-md transition-colors duration-200 hover:bg-[#e7e0d6] hover:text-[#6b6b3d]"
                        >
                          Terms & Conditions
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4 text-[#1f1f1f]">
              <Link
                href="/favourites"
                aria-label="Favourites"
                className="transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <FaRegHeart className="text-[20px] md:text-[22px]" />
              </Link>

              <button
                type="button"
                aria-label="Profile"
                onClick={() => setIsAccountOpen(true)}
                className="transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <CgProfile className="text-[26px] md:text-[29px]" />
              </button>

              <button
                type="button"
                aria-label="Search"
                onClick={() => setIsSearchOpen(true)}
                className="transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <FaMagnifyingGlass className="text-[20px] md:text-[22px]" />
              </button>

              <Link
                href="/cart"
                aria-label="Cart"
                className="relative transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <IoCartOutline className="text-[28px] md:text-[30px]" />
                <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6b7340] text-[10px] font-bold text-white">
                  {cartCount > 0 ? cartCount : 0}
                </span>
              </Link>

              <button
                type="button"
                className="text-2xl text-[#1f1f1f] transition-colors duration-200 hover:text-[#6b6b3d] md:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Improved Layout */}
        <div
          className={`overflow-y-auto transition-all duration-300 md:hidden ${
            isOpen ? "max-h-[calc(100vh-70px)] border-t border-[#e7e0d6] py-4" : "max-h-0"
          }`}
          style={{ maxHeight: isOpen ? "calc(100vh - 70px)" : "0" }}
        >
          <div className="flex flex-col space-y-3 px-4 bg-[#f5f1ea] pb-20">
            {/* Home */}
            <Link
              href="/"
              onClick={handleLinkClick}
              className="py-2 font-semibold text-[#1f1f1f] text-base transition-colors duration-200 hover:text-[#6b6b3d] border-b border-[#e7e0d6]"
            >
              Home
            </Link>

            {/* Shop by Category - Accordion */}
            <div className="border-b border-[#e7e0d6]">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between py-2 font-semibold text-[#1f1f1f] text-base transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <div className="flex items-center gap-2">
                  <HiOutlineSquares2X2 className="text-xl" />
                  <span>Shop by Category</span>
                </div>
                {isCategoriesOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
              </button>
              
              {/* Categories Submenu */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isCategoriesOpen ? "max-h-[500px] opacity-100 pb-3" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-6 flex flex-col space-y-2">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <Link
                        key={category}
                        href={`/categories/${encodeURIComponent(category)}`}
                        onClick={handleLinkClick}
                        className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                      >
                        {category}
                      </Link>
                    ))
                  ) : (
                    <>
                      {navItems.slice(0, 8).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bestsellers */}
            <Link
              href="/bestsellers"
              onClick={handleLinkClick}
              className="py-2 font-semibold text-[#1f1f1f] text-base transition-colors duration-200 hover:text-[#6b6b3d] border-b border-[#e7e0d6]"
            >
              Bestsellers
            </Link>

            {/* About Us */}
            <Link
              href="/About"
              onClick={handleLinkClick}
              className="py-2 font-semibold text-[#1f1f1f] text-base transition-colors duration-200 hover:text-[#6b6b3d] border-b border-[#e7e0d6]"
            >
              About Us
            </Link>

            {/* Customers - Accordion */}
            <div className="border-b border-[#e7e0d6]">
              <button
                onClick={() => setIsCustomersOpen(!isCustomersOpen)}
                className="w-full flex items-center justify-between py-2 font-semibold text-[#1f1f1f] text-base transition-colors duration-200 hover:text-[#6b6b3d]"
              >
                <span>Customers</span>
                {isCustomersOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
              </button>
              
              {/* Customers Submenu */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isCustomersOpen ? "max-h-[300px] opacity-100 pb-3" : "max-h-0 opacity-0"
                }`}
              >
                <div className="pl-6 flex flex-col space-y-2">
                  <Link
                    href="/orders"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/contact"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/favourites"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    My Wishlist
                  </Link>
                  <Link
                    href="/refund-policy"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    Refund & Cancellation Policy
                  </Link>
                  <Link
                    href="/privacy-policy"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms-conditions"
                    onClick={handleLinkClick}
                    className="py-1.5 font-medium text-[#4b4b4b] text-sm transition-colors duration-200 hover:text-[#6b6b3d] hover:pl-2"
                  >
                    Terms & Conditions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />
    </>
  );
}