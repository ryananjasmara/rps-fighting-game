/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to prevent double socket connections in development
  output: 'standalone',
}

module.exports = nextConfig
