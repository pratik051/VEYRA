"use client";
import React from "react";

export default function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`mt-1 p-2 border border-black/[0.06] rounded-xl w-full bg-white text-sajilomarts-text placeholder-sajilomarts-muted focus:border-sajilomarts-gold focus:ring-0 dark:bg-[#0b0c0f] dark:border-white/[0.06] dark:text-slate-100 ${className}`}
    />
  );
}
