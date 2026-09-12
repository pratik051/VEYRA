"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopBanner } from "@/components/layout/top-banner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { BackToTop } from "@/components/ui/back-to-top";
import { SupportChat } from "@/components/support/support-chat";

const ISOLATED_ROUTES = ["/dashboard", "/account", "/admin", "/login", "/signup"];

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isIsolated = ISOLATED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isIsolated) {
    return <div className="min-h-screen w-full flex flex-col">{children}</div>;
  }

  return (
    <>
      <TopBanner />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <BackToTop />
    </>
  );
}
