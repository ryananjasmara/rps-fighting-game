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
    // Disable code splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: false,
      runtimeChunk: false
    }

    // Force all JavaScript into one file
    config.optimization.minimize = true;
    config.optimization.moduleIds = 'deterministic';

    return config;
  },

  // Experimental features untuk optimasi
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@components', '@hooks'],
    turbotrace: {
      logLevel: 'error',
      logDetail: true,
    },
  },

  // Compress responses
  compress: true,

  // Disable powered by header
  poweredByHeader: false,
}

module.exports = nextConfig
