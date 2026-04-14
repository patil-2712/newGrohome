"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaPinterestP,
  FaLinkedinIn,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaPaypal,
} from "react-icons/fa";

const navItems = [
  { label: "Sweets", href: "/categories/Sweets" },
  { label: "Spices", href: "/categories/Spices" },
  { label: "Konkan", href: "/categories/Konkan" },
  { label: "Rices", href: "/categories/Rice" },
  { label: "Pickles", href: "/categories/pickles" },
  { label: "Sandge/Chutneys", href: "/categories/Chutneys" },
  { label: "Papad/Sevai", href: "/categories/Papad" },
  { label: "Flours", href: "/categories/Flours" },

];

const quickLinks = [
  { label: "About Us", href: "/About" },
  { label: "Contact Us", href: "/contact" },
  { label: "Refund & Cancellation Policy", href: "/refund-cancellation-policy" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com", icon: FaFacebookF },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: FaLinkedinIn },
  { label: "Instagram", href: "https://www.instagram.com", icon: FaInstagram },
  { label: "Twitter", href: "https://www.twitter.com", icon: FaTwitter },
  { label: "YouTube", href: "https://www.youtube.com", icon: FaYoutube },
  { label: "Pinterest", href: "https://www.pinterest.com", icon: FaPinterestP },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 text-gray-800">
      <div className="mx-auto max-w-[1500px] px-4 pb-6 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <Link
              href="/"
              className="mb-5 flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
            >
              <Image
                src="/gruhamlogo.jpg"
                alt="Gruham Logo"
                width={58}
                height={58}
                quality={100}
                className="rounded-md object-contain"
              />
              <span className="text-lg font-semibold leading-snug text-gray-800">
                Gruham - Traditional Flavours of Maharashtra
              </span>
            </Link>

            <p className="text-sm leading-7 text-gray-700">
              Discover authentic Maharashtrian flavours made with care and
              tradition. From sweets and spices to pickles, flours, and Konkan
              specialties, Gruham brings homemade taste and quality to every
              home.
            </p>

            <p className="mt-5 text-sm text-gray-700">
              <span className="font-semibold">Contact Us: </span>
              <a
                href="mailto:civihi5653@peogi.com"
                className="underline underline-offset-4 transition hover:text-black"
              >
                civihi5653@peogi.com
              </a>
            </p>
          </div>

          {/* Column 2: Shop Categories */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Shop Categories
            </h3>
            <ul className="space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-700 transition hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-gray-700 transition hover:text-black"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Social */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-gray-900">
              Connect With Us
            </h3>
            <ul className="space-y-3 text-sm">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 transition hover:text-black"
                    >
                      <Icon className="text-base" />
                      <span>{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="my-10 border-t border-gray-300" />

        <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Gruham. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-3xl text-gray-700">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaPaypal />
            <FaCcDiscover />
          </div>
        </div>
      </div>
    </footer>
  );
}