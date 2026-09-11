import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUserByToken } from "@/lib/auth/store";
import { AUTH_COOKIE_NAME, LEGACY_AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;
  
  if (!sessionUser || sessionUser.role !== "admin") {
    redirect("/account?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-md flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-sm">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-lg tracking-wider text-white group-hover:text-amber-400 transition">
                  LINKOVA
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Control Center &amp; Sourcing Engine</p>
            </div>
          </Link>
        </div>

        {/* Center Quick Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold">
          <Link href="/admin" className="px-3 py-1 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition">
            Dashboard
          </Link>
          <Link href="/shop" target="_blank" className="px-3 py-1 rounded-full text-slate-300 hover:text-white transition">
            Storefront ↗
          </Link>
          <Link href="/request-product" target="_blank" className="px-3 py-1 rounded-full text-slate-300 hover:text-white transition">
            India Sourcing ↗
          </Link>
        </nav>

        {/* Right User & Actions */}
        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-bold text-white truncate max-w-[180px]">
              {sessionUser.fullName || "Administrator"}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
              {sessionUser.email}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800 hidden sm:block" />

          <Link
            href="/account"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
          >
            <span>My Account</span>
          </Link>

          <form method="post" action="/api/auth/logout">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all font-bold"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
