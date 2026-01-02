/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'pdfjs-dist'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  webpack: (config, { isServer }) => {
    // Mark canvas as external for server-side only
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })
    } else {
      // For client-side, ignore canvas
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      }
    }
    return config
  },
}

module.exports = nextConfig

