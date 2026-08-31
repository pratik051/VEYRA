"use client";
import React from "react";

export default function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`mt-1 p-2 border rounded ${className}`}>{children}</select>;
}
