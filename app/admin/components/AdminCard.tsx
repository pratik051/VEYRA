"use client";
import React from "react";

export default function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`max-w-6xl mx-auto bg-white p-6 rounded shadow-sm ${className}`}>{children}</div>;
}
