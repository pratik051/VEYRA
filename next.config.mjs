/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" }
    ]
  },
  async rewrites() {
    const backendUrl = process.env.RENDER_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes("localhost")) {
      const cleanUrl = backendUrl.replace(/\/$/, "");
      return [
        {
          source: "/api/:path*",
          destination: `${cleanUrl}/api/:path*`
        }
      ];
    }
    return [];
  }
};

export default nextConfig;
