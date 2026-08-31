"use client";
import React from "react";

export default function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`mt-1 p-2 border rounded w-full ${className}`} />;
}
