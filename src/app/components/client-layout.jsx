"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./botton-nav";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const showBottomNav = ["/find", "/list", "/profile"].includes(pathname);

  return (
    <>
      {children}
      {showBottomNav && <BottomNav />}
    </>
  );
}
