"use client";

import { usePathname } from "next/navigation";
import Navbar from "./(dashboard)/Ecommerce/components/Navbar";
import Footer from "./(dashboard)/Ecommerce/components/Footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideLayout =
    pathname === "/signin" || pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
}