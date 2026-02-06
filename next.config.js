/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname
  },
  typescript: {
    // Skip TypeScript errors if needed
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
