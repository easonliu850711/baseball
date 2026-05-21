const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', 
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // 優化設定
  compress: true,
  poweredByHeader: false,
  
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src')
    return config
  },
  
  experimental: {
    // 未來擴展
  },
}

module.exports = nextConfig
