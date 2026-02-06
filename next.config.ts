import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-date-pickers",
      "recharts",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "date-fns",
      "lodash",
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
