"use client";
import React from "react";

export default function Textarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`mt-1 p-2 border rounded w-full ${className}`} />;
}
