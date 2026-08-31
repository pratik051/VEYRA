import React from "react";
import Link from "next/link";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProductRequestModel } from "@/lib/models/product-request-model";
import { getSessionUserByToken } from "@/lib/auth/store";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Table from "../components/Table";
import AdminCard from "../components/AdminCard";

type ProductRequestSummary = {
  requestId: string;
  fullName: string;
  productUrl: string;
  detectedPlatform: string;
  status: string;
  createdAt: string;
};

export default async function AdminProductRequestsPage() {
  // Server-side: ensure admin
  const token = cookies().get("veyra_session")?.value;
  const sessionUser = token ? await getSessionUserByToken(token) : null;
  if (!sessionUser || sessionUser.role !== "admin") redirect("/");

  await connectToDatabase();
  const items = await ProductRequestModel.find({}).sort({ createdAt: -1 }).limit(100).lean();

  return (
    <AdminCard>
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-4">Product Requests (Admin)</h1>
        {items.length === 0 && <p className="text-sm text-slate-600">No requests found.</p>}

        {items.length > 0 && (
          <Table>
            <thead>
              <tr className="text-left text-sm text-slate-600">
                <th className="p-2">Request ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Platform</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d: any) => (
                <tr key={d.requestId} className="border-t">
                  <td className="p-2">{d.requestId}</td>
                  <td className="p-2">{d.fullName}</td>
                  <td className="p-2">{d.detectedPlatform}</td>
                  <td className="p-2">{d.status}</td>
                  <td className="p-2">{new Date(d.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <Link href={`/admin/product-requests/${encodeURIComponent(d.requestId)}`} className="text-sky-600 hover:underline">View / Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </AdminCard>
  );
}
