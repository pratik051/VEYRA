import React from "react";
import Image from "next/image";

interface SajiloMartsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  showTagline?: boolean;
  showFlags?: boolean;
}

export function SajiloMartsBrandLogo({
  className = "",
  size = "md",
  theme = "dark",
  showTagline = true,
  showFlags = true
}: SajiloMartsLogoProps) {
  const isDark = theme === "dark";

  const iconWidth = size === "sm" ? 140 : size === "md" ? 200 : size === "lg" ? 280 : 360;
  const taglineSize = size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "text-base";

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* ─── OFFICIAL SAJILOMARTS LOGO IMAGE ─── */}
      <div className="relative flex items-center justify-center">
        <Image
          src="/sajilomarts-logo.png"
          alt="SajiloMarts - Shop Easy • Live Better"
          width={iconWidth}
          height={iconWidth}
          className="object-contain drop-shadow-md transition-transform hover:scale-105"
          priority
        />
      </div>

      {showTagline && (
        <p className={`font-semibold tracking-wider text-slate-500 uppercase mt-1 ${taglineSize}`}>
          — Shop Easy • Live Better —
        </p>
      )}

      {showFlags && (
        <div className="flex items-center justify-center gap-2 pt-1.5">
          <span className="h-[1px] w-6 bg-slate-300 block" />
          <span className="text-xs">🇮🇳</span>
          <span className="text-xs text-orange-500 font-bold">➔</span>
          <span className="text-xs">🇳🇵</span>
          <span className="h-[1px] w-6 bg-slate-300 block" />
        </div>
      )}
    </div>
  );
}

/**
 * Compact Horizontal Brand Header Logo
 */
export function SajiloMartsHeaderBrand({ theme = "light", className = "" }: { theme?: "dark" | "light"; className?: string }) {
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official SajiloMarts Logo */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <Image
          src="/sajilomarts-logo.png"
          alt="SajiloMarts"
          width={150}
          height={48}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>
    </div>
  );
}
