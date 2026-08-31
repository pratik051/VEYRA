import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUserByToken } from "@/lib/auth/store";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("veyra_session")?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;
  if (!sessionUser || sessionUser.role !== "admin") {
    // Not authorized — redirect to admin login
    redirect("/admin/login");
  }

  return (
    <html>
      <body className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen font-sans">
          <aside className="w-60 bg-slate-900 text-slate-100 p-4">
            <h2 className="text-lg font-semibold">VEYRA Admin</h2>
            <nav className="mt-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/admin/product-requests" className="text-slate-300 hover:text-white">Product Requests</Link>
                </li>
                <li>
                  <Link href="/admin" className="text-slate-300 hover:text-white">Dashboard</Link>
                </li>
              </ul>
            </nav>

            <div className="absolute bottom-4 left-4">
              <form method="post" action="/api/auth/logout">
                <button type="submit" className="text-red-400 hover:text-red-200">Sign out</button>
              </form>
            </div>
          </aside>

          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
