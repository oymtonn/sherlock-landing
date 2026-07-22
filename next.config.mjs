/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the live dev server's generated chunks separate from production
  // builds. Running `next build` while `next dev` is open would otherwise
  // replace files in `.next` and cause MODULE_NOT_FOUND errors on refresh.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
