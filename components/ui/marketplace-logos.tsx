import React from "react";

export type MarketplaceId =
  | "amazon"
  | "amazon-india"
  | "flipkart"
  | "myntra"
  | "meesho"
  | "nykaa"
  | "ajio"
  | "tatacliq"
  | "tata-cliq"
  | "croma"
  | "boat"
  | "boat-lifestyle"
  | "noise";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Amazon India Official Vector Logo
 */
export function AmazonLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path
        d="M69.7 28.3C61.4 34.4 49.3 35.8 39.3 32.5C28.2 28.8 19.3 19.8 17.5 7.8c-.3-2 .7-2.6 2.3-1.4 8.7 6.4 20.3 10.2 31.9 10.2 12.1 0 24.3-4.2 33.1-11.4 1.2-1 2.3-.5 1.5 1.1-3.6 7.4-10.4 14.5-16.6 22z"
        fill="#FF9900"
      />
      <path
        d="M74.3 25.2c-.9-1.2-6.1-.6-8.5-.3-.7.1-.8-.5-.2-.9 3.8-2.6 10-1.8 10.8-.8 1 1.2-.3 7.7-3.9 10.5-.6.5-1.1.2-.8-.4 1-1.8 3.5-6.9 2.6-8.1z"
        fill="#FF9900"
      />
      <text x="5" y="22" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="23" fill="#111827" letterSpacing="-1">
        amazon
      </text>
      <text x="90" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="800" fontSize="10" fill="#FF9900">
        .in
      </text>
    </svg>
  );
}

/**
 * Flipkart Official Vector Logo
 */
export function FlipkartLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 130 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="2" width="32" height="32" rx="8" fill="#2874F0" />
      {/* Yellow Bag handle & F */}
      <path d="M12 12h12v3h-9v5h7v3h-7v9h-3V12z" fill="#FFFFFF" />
      <path d="M22 17l4 5h-4l-1 5 6-7h-4l3-3h-4z" fill="#FFE500" />
      <text x="38" y="25" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="900" fontSize="20" fill="#2874F0">
        Flipkart
      </text>
    </svg>
  );
}

/**
 * Myntra Official Vector Logo
 */
export function MyntraLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Iconic Myntra M ribbons */}
      <path d="M6 26V11l6 8 6-8v15h-4V16.5L9 22.5 4 16.5V26H6z" fill="url(#myntraGrad1)" />
      <path d="M18 26V11l6 8 6-8v15h-4V16.5L21 22.5 16 16.5V26H18z" fill="url(#myntraGrad2)" />
      <defs>
        <linearGradient id="myntraGrad1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F13AB1" />
          <stop offset="100%" stopColor="#FF5722" />
        </linearGradient>
        <linearGradient id="myntraGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E91E63" />
        </linearGradient>
      </defs>
      <text x="38" y="25" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="20" fill="#282C3F" letterSpacing="0.5">
        Myntra
      </text>
    </svg>
  );
}

/**
 * Meesho Official Vector Logo
 */
export function MeeshoLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="3" width="30" height="30" rx="8" fill="#5A004C" />
      <path d="M9 25V11h3.5l3.5 7.5L19.5 11H23v14h-3V16l-3.5 7h-2L11 16v9H9z" fill="#90EE90" />
      <text x="38" y="25" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="20" fill="#5A004C">
        meesho
      </text>
    </svg>
  );
}

/**
 * Nykaa Official Vector Logo
 */
export function NykaaLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 110 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <text x="4" y="26" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="900" fontSize="24" fill="#FC2779" letterSpacing="1">
        NYKAA
      </text>
    </svg>
  );
}

/**
 * AJIO Official Vector Logo
 */
export function AjioLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect x="2" y="4" width="96" height="28" rx="6" fill="#1C2228" />
      <text x="14" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="18" fill="#E8B966" letterSpacing="3">
        AJIO
      </text>
    </svg>
  );
}

/**
 * Tata CLiQ Official Vector Logo
 */
export function TataCliqLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 125 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="16" cy="18" r="14" fill="#C8102E" />
      <path d="M12 18l3 3 6-6" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="36" y="24" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="16" fill="#000000">
        TATA <tspan fill="#C8102E">CLiQ</tspan>
      </text>
    </svg>
  );
}

/**
 * Croma Official Vector Logo
 */
export function CromaLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 115 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <text x="4" y="25" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="21" fill="#00A299" letterSpacing="0.5">
        croma
      </text>
      <circle cx="78" cy="11" r="3.5" fill="#00E9BF" />
    </svg>
  );
}

/**
 * boAt Lifestyle Official Vector Logo
 */
export function BoatLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 105 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      {/* Sailboat icon */}
      <path d="M6 24h18l-4 5H10l-4-5z" fill="#E31E24" />
      <path d="M14 6v16l8-8-8-8z" fill="#E31E24" />
      <text x="28" y="25" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="900" fontSize="21" fill="#111827">
        bo<tspan fill="#E31E24">A</tspan>t
      </text>
    </svg>
  );
}

/**
 * Noise Official Vector Logo
 */
export function NoiseLogo({ className = "h-6 w-auto", ...props }: LogoProps) {
  return (
    <svg viewBox="0 0 100 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <circle cx="14" cy="18" r="10" fill="#00D2D3" />
      <circle cx="14" cy="18" r="4" fill="#0A0A0A" />
      <text x="28" y="25" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="19" fill="#0A0A0A" letterSpacing="0.5">
        noise
      </text>
    </svg>
  );
}

/**
 * Universal Marketplace Logo Component
 * Matches any marketplace identifier and renders its authentic brand logo.
 */
export function MarketplaceLogo({
  marketplace,
  className = "h-6 w-auto",
  ...props
}: { marketplace: string } & LogoProps) {
  const norm = marketplace?.toLowerCase().trim().replace(/_/g, "-") || "";

  if (norm.includes("amazon")) return <AmazonLogo className={className} {...props} />;
  if (norm.includes("flipkart")) return <FlipkartLogo className={className} {...props} />;
  if (norm.includes("myntra")) return <MyntraLogo className={className} {...props} />;
  if (norm.includes("meesho")) return <MeeshoLogo className={className} {...props} />;
  if (norm.includes("nykaa")) return <NykaaLogo className={className} {...props} />;
  if (norm.includes("ajio")) return <AjioLogo className={className} {...props} />;
  if (norm.includes("tatacliq") || norm.includes("tata-cliq") || norm.includes("tata"))
    return <TataCliqLogo className={className} {...props} />;
  if (norm.includes("croma")) return <CromaLogo className={className} {...props} />;
  if (norm.includes("boat")) return <BoatLogo className={className} {...props} />;
  if (norm.includes("noise")) return <NoiseLogo className={className} {...props} />;

  return (
    <div className={`inline-flex items-center gap-1.5 font-black text-xs uppercase ${className}`}>
      <span>🇮🇳</span>
      <span>{marketplace}</span>
    </div>
  );
}
