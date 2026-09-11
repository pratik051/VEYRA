import AccountPage from "@/app/account/page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Dashboard — LINKOVA",
  description: "Manage your India to Nepal sourcing orders, tracking, passport wallet, and account settings."
};

export default function DashboardPage() {
  return <AccountPage />;
}
