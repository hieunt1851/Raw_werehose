/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'tastevn-ai-services.ig3.ai'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://ai.block8910.com/api/dev/:path*',
      },
      {
        source: '/proxy-ai-services/:path*',
        destination: 'https://tastevn-ai-services.ig3.ai/:path*',
      },
      {
        source: '/proxy-raw-meat/:path*',
        destination: 'http://171.244.46.137:9001/raw-meat/:path*',
      },
      {
        source: '/proxy-ai-captures/:path*',
        destination: 'https://tastevn-ai-services.ig3.ai/captures/:path*',
      },
    ];
  },
  // Optimize build process
  swcMinify: true,
  // Disable telemetry during build
  telemetry: false,
  // Optimize webpack
  webpack: (config, { dev, isServer }) => {
    // Add any webpack optimizations here if needed
    return config;
  },
}

module.exports = nextConfig 