import type { NextConfig } from "next";

// Static export → deployable to GitHub Pages. Do not remove `output: "export"`.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
