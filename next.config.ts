import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 90 para las fotos de producto de la landing: a 75 el vidrio y el oro pierden filo.
    qualities: [75, 90],
  },
};

export default nextConfig;
