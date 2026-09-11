"use client";
import React from "react";

export default function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`mt-1 p-2 border border-black/[0.06] rounded-xl bg-white text-linkova-text placeholder-linkova-muted focus:border-linkova-gold focus:ring-0 dark:bg-[#0b0c0f] dark:border-white/[0.06] dark:text-slate-100 ${className}`}
    >
      {children}
    </select>
  );
}
