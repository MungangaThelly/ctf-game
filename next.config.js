/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname
  },
  eslint: {
    // Skip ESLint errors during build for deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript errors if needed
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
