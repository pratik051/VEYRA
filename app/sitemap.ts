import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/shop",
    "/request-product",
    "/how-it-works",
    "/track-order",
    "/about",
    "/contact",
    "/faq",
    "/cart",
    "/checkout",
    "/account",
    "/admin",
    "/privacy-policy",
    "/terms-and-conditions",
    "/shipping-policy",
    "/return-policy",
    "/refund-policy",
    "/cancellation-policy",
    "/product-request-policy"
  ];

  return routes.map((route) => ({
    url: `https://sajilomarts.com.np${route}`,
    lastModified: new Date()
  }));
}
