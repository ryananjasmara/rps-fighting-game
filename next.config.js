/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double socket connections in development
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporary fix
  },
  // Hapus assetPrefix karena bisa menyebabkan masalah loading
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',

  // Pastikan images dan static files bisa diakses
  images: {
    domains: ['localhost', 'vercel.app'], // sesuaikan dengan domain Anda
    unoptimized: true,
  },

  // Optimize chunks dengan lebih sederhana
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        commons: {
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    };
    return config;
  },
}

module.exports = nextConfig
