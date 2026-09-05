/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // unoptimized: true, // Re-enable optimization for better performance
  },
  serverExternalPackages: ["typeorm", "tsyringe", "reflect-metadata", "mysql2"],
}

export default nextConfig
