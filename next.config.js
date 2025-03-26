/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double socket connections in development
  output: 'export',
  images: {
    unoptimized: true
  },
  // Tambahkan ini untuk mengatasi masalah routing
  trailingSlash: true,
  // Disable webpack optimization
  webpack: (config) => {
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;
    return config;
  }
}

module.exports = nextConfig
