"use client";
import React from "react";

export default function Button({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-60 focus:ring-2 focus:ring-offset-1 focus:ring-sky-300 dark:bg-sky-500 dark:focus:ring-sky-400 ${className}`}
    >
      {children}
    </button>
  );
}
