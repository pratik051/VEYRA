"use client";
import React from "react";

export default function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full table-auto border-collapse">{children}</table>
    </div>
  );
}
