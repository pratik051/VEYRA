"use client";
import React from "react";

export default function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
