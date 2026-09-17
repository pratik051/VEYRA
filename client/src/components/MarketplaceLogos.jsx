import React from 'react';

export function MarketplaceLogo({ marketplace, className = "h-6 w-auto" }) {
  const norm = (marketplace || "").toLowerCase().trim();

  if (norm.includes("amazon")) {
    return (
      <span className={`inline-flex items-center font-black tracking-tighter text-amber-500 text-base ${className}`}>
        amazon<span className="text-neutral-900 dark:text-neutral-100 text-xs font-semibold ml-0.5">.in</span>
      </span>
    );
  }
  if (norm.includes("flipkart")) {
    return (
      <span className={`inline-flex items-center font-black italic tracking-tight text-blue-600 dark:text-blue-400 text-base ${className}`}>
        Flipkart<span className="text-amber-500 font-bold ml-0.5">✦</span>
      </span>
    );
  }
  if (norm.includes("myntra")) {
    return (
      <span className={`inline-flex items-center font-black tracking-widest text-rose-500 dark:text-rose-400 uppercase text-sm ${className}`}>
        MYNTRA
      </span>
    );
  }
  if (norm.includes("meesho")) {
    return (
      <span className={`inline-flex items-center font-extrabold text-pink-600 dark:text-pink-400 lowercase text-base tracking-tight ${className}`}>
        meesho
      </span>
    );
  }
  if (norm.includes("nykaa")) {
    return (
      <span className={`inline-flex items-center font-black tracking-widest text-fuchsia-600 dark:text-fuchsia-400 uppercase text-sm ${className}`}>
        NYKAA
      </span>
    );
  }
  if (norm.includes("ajio")) {
    return (
      <span className={`inline-flex items-center font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase text-sm ${className}`}>
        AJIO
      </span>
    );
  }
  if (norm.includes("tata") || norm.includes("cliq")) {
    return (
      <span className={`inline-flex items-center font-bold tracking-tight text-red-700 dark:text-red-400 text-sm ${className}`}>
        TATA <span className="font-light ml-1 text-neutral-800 dark:text-neutral-200">CLiQ</span>
      </span>
    );
  }
  if (norm.includes("croma")) {
    return (
      <span className={`inline-flex items-center font-black tracking-widest text-teal-600 dark:text-teal-400 uppercase text-sm ${className}`}>
        croma
      </span>
    );
  }
  if (norm.includes("boat")) {
    return (
      <span className={`inline-flex items-center font-black lowercase text-red-600 text-base tracking-tighter ${className}`}>
        bo<span className="text-neutral-900 dark:text-white">A</span>t
      </span>
    );
  }
  if (norm.includes("noise")) {
    return (
      <span className={`inline-flex items-center font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase text-sm ${className}`}>
        NOISE
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold text-neutral-800 dark:text-white text-sm ${className}`}>
      {marketplace || "Store"}
    </span>
  );
}
