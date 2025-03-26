/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double socket connections in development
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporary fix
  },
  webpack: (config, { isServer }) => {
    // Optimize chunks
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 70000,
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /node_modules/,
          priority: 20,
        },
        // Common chunk
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    };
    return config;
  },
  // Tambahkan ini untuk memastikan asset loading yang benar
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
  // Disable image optimization jika tidak digunakan
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
