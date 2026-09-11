import React from "react";

interface LinkovaLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light";
  showTagline?: boolean;
  showFlags?: boolean;
}

export function LinkovaBrandLogo({
  className = "",
  size = "md",
  theme = "dark",
  showTagline = true,
  showFlags = true
}: LinkovaLogoProps) {
  const isDark = theme === "dark";

  // Dimensions based on size prop
  const iconSize = size === "sm" ? 36 : size === "md" ? 54 : size === "lg" ? 80 : 120;
  const titleSize = size === "sm" ? "text-lg" : size === "md" ? "text-2xl" : size === "lg" ? "text-4xl" : "text-5xl";
  const taglineSize = size === "sm" ? "text-[9px]" : size === "md" ? "text-xs" : size === "lg" ? "text-sm" : "text-base";

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* ─── 3D L ICON WITH AIRPLANE SWOOSH & DELIVERY BOX ─── */}
      <div className="relative flex items-center justify-center">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_8px_24px_rgba(0,163,255,0.35)]"
        >
          <defs>
            {/* L Top Gradient */}
            <linearGradient id="linkovaLGrad" x1="40" y1="20" x2="100" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="40%" stopColor="#00A3FF" />
              <stop offset="80%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>

            {/* L Inner Bevel Shadow */}
            <linearGradient id="linkovaLBevel" x1="40" y1="20" x2="70" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            {/* Airplane Swoosh Trail Gradient */}
            <linearGradient id="linkovaTrailGrad" x1="30" y1="90" x2="135" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00A3FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="1" />
            </linearGradient>

            {/* 3D Box Gradients */}
            <linearGradient id="boxTopGrad" x1="90" y1="90" x2="120" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00A3FF" />
            </linearGradient>
            <linearGradient id="boxLeftGrad" x1="85" y1="95" x2="102" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0088FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>
            <linearGradient id="boxRightGrad" x1="102" y1="95" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0044CC" />
              <stop offset="100%" stopColor="#002277" />
            </linearGradient>
          </defs>

          {/* 3D "L" Monogram Structure */}
          {/* Main vertical stem & curved foot */}
          <path
            d="M 52 24 
               C 52 20, 68 20, 68 24 
               L 68 88 
               C 68 108, 82 120, 108 120 
               C 114 120, 118 116, 118 110 
               C 118 104, 114 98, 104 98 
               C 84 98, 72 88, 72 70 
               L 72 24 
               C 72 20, 52 20, 52 24 Z"
            fill="url(#linkovaLGrad)"
          />

          {/* Left Vertical Pillar Main Shape */}
          <path
            d="M 50 24 
               C 50 20, 66 18, 70 24 
               L 70 100 
               C 70 118, 88 126, 114 116 
               C 118 114, 119 122, 112 126 
               C 82 138, 50 126, 50 96 
               Z"
            fill="url(#linkovaLGrad)"
          />

          {/* Bevel highlight along top edge */}
          <path
            d="M 50 24 L 56 20 L 70 24 L 64 28 Z"
            fill="url(#linkovaLBevel)"
          />

          {/* 3D Delivery Package Box in curve */}
          <g transform="translate(86, 78) scale(0.9)">
            {/* Box Top */}
            <polygon points="18,0 36,9 18,18 0,9" fill="url(#boxTopGrad)" />
            {/* Box Left */}
            <polygon points="0,9 18,18 18,36 0,27" fill="url(#boxLeftGrad)" />
            {/* Box Right */}
            <polygon points="18,18 36,9 36,27 18,36" fill="url(#boxRightGrad)" />
            {/* Box Center seam */}
            <line x1="18" y1="18" x2="18" y2="36" stroke="#002277" strokeWidth="1" />
            <line x1="9" y1="4.5" x2="27" y2="13.5" stroke="#002277" strokeWidth="1" opacity="0.6" />
          </g>

          {/* Orbital Flight Path Swoosh */}
          <path
            d="M 32 94 
               C 26 84, 38 72, 60 62 
               C 82 52, 108 44, 134 34"
            fill="none"
            stroke="url(#linkovaTrailGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Outer arc tail */}
          <path
            d="M 28 88 
               C 24 98, 36 108, 62 102 
               C 86 96, 112 84, 136 68"
            fill="none"
            stroke="url(#linkovaTrailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Airplane Soaring Upwards */}
          <g transform="translate(130, 26) rotate(-28) scale(0.85)">
            <path
              d="M 12 0 
                 L 16 10 
                 L 26 12 
                 L 16 15 
                 L 14 24 
                 L 10 18 
                 L 2 18 
                 L 8 13 
                 L 6 0 Z"
              fill="#00E5FF"
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
          </g>
        </svg>
      </div>

      {/* ─── BRAND TYPOGRAPHY ─── */}
      <div className="text-center mt-2 space-y-1">
        <div className={`font-display font-black tracking-widest leading-none ${titleSize}`}>
          <span className={isDark ? "text-white" : "text-slate-900"}>LINK</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] via-[#00A3FF] to-[#0066FF]">
            OVA
          </span>
        </div>

        {showTagline && (
          <p className={`font-medium tracking-[0.25em] uppercase ${taglineSize} ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Your Link. Our Delivery.
          </p>
        )}

        {showFlags && (
          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="h-[1px] w-6 bg-slate-500/40 block" />
            <span className="text-xs">🇮🇳</span>
            <span className="text-xs text-blue-400 font-bold">➔</span>
            <span className="text-xs">🇳🇵</span>
            <span className="h-[1px] w-6 bg-slate-500/40 block" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact Horizontal Brand Header Logo
 */
export function LinkovaHeaderBrand({ theme = "light", className = "" }: { theme?: "dark" | "light"; className?: string }) {
  const isDark = theme === "dark";
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official 3D 'L' Emblem with Airplane Swoosh & Delivery Box */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <svg
          width={40}
          height={40}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_12px_rgba(0,163,255,0.3)]"
        >
          <defs>
            <linearGradient id="headerLGrad" x1="40" y1="20" x2="100" y2="130" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="40%" stopColor="#00A3FF" />
              <stop offset="80%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>
            <linearGradient id="headerTrailGrad" x1="30" y1="90" x2="135" y2="35" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#00A3FF" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
            <linearGradient id="headerBoxTop" x1="90" y1="90" x2="120" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#00A3FF" />
            </linearGradient>
            <linearGradient id="headerBoxLeft" x1="85" y1="95" x2="102" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0088FF" />
              <stop offset="100%" stopColor="#0044CC" />
            </linearGradient>
            <linearGradient id="headerBoxRight" x1="102" y1="95" x2="120" y2="120" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0044CC" />
              <stop offset="100%" stopColor="#002277" />
            </linearGradient>
          </defs>

          {/* 3D "L" Monogram Structure */}
          <path
            d="M 50 24 C 50 20, 66 18, 70 24 L 70 100 C 70 118, 88 126, 114 116 C 118 114, 119 122, 112 126 C 82 138, 50 126, 50 96 Z"
            fill="url(#headerLGrad)"
          />
          <path
            d="M 52 24 C 52 20, 68 20, 68 24 L 68 88 C 68 108, 82 120, 108 120 C 114 120, 118 116, 118 110 C 118 104, 114 98, 104 98 C 84 98, 72 88, 72 70 L 72 24 C 72 20, 52 20, 52 24 Z"
            fill="url(#headerLGrad)"
          />

          {/* 3D Delivery Package Box */}
          <g transform="translate(86, 78) scale(0.9)">
            <polygon points="18,0 36,9 18,18 0,9" fill="url(#headerBoxTop)" />
            <polygon points="0,9 18,18 18,36 0,27" fill="url(#headerBoxLeft)" />
            <polygon points="18,18 36,9 36,27 18,36" fill="url(#headerBoxRight)" />
            <line x1="18" y1="18" x2="18" y2="36" stroke="#002277" strokeWidth="1" />
          </g>

          {/* Orbital Flight Path Swoosh */}
          <path
            d="M 32 94 C 26 84, 38 72, 60 62 C 82 52, 108 44, 134 34"
            fill="none"
            stroke="url(#headerTrailGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 28 88 C 24 98, 36 108, 62 102 C 86 96, 112 84, 136 68"
            fill="none"
            stroke="url(#headerTrailGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Airplane */}
          <g transform="translate(130, 26) rotate(-28) scale(0.85)">
            <path
              d="M 12 0 L 16 10 L 26 12 L 16 15 L 14 24 L 10 18 L 2 18 L 8 13 L 6 0 Z"
              fill="#00E5FF"
              stroke="#FFFFFF"
              strokeWidth="0.8"
            />
          </g>
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`font-display text-xl font-black tracking-tight leading-none ${isDark ? "text-white" : "text-slate-900"}`}>
          LINK<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#0066FF]">OVA</span>
        </span>
        <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase pt-0.5">
          Your Link. Our Delivery.
        </span>
      </div>
    </div>
  );
}
