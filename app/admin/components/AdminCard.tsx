"use client";
import React from "react";

export default function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-6xl mx-auto bg-white p-6 rounded-2xl border border-black/[0.06] shadow-card text-linkova-text dark:glass-card-dark dark:text-slate-100 ${className}`}
    >
      {children}
    </div>
  );
}
