/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only treat files with these extensions as Next pages to avoid accidental
  // routing conflicts with existing `.tsx` files (e.g. optional catch-all).
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
}

module.exports = nextConfig
