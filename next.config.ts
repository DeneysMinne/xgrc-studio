import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Route all /uploads/* requests through the media API route.
    // In dev this reads from public/uploads/; in production it reads from STORAGE_PATH/uploads/.
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/media/uploads/:path*',
      },
    ]
  },
};

export default nextConfig;
