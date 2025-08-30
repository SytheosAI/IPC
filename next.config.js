/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for debugging
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Don't modify devtool as Next.js manages it automatically
    
    // Add webpack plugins for better debugging
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      })
    )
    
    // Disable minimization in development for better debugging
    if (dev) {
      config.optimization.minimize = false
    }
    
    // Add module resolution for better debugging
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    
    // Better error overlay in development
    if (dev && !isServer) {
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'source-map-loader',
            options: {
              filterSourceMappingUrl: (url, resourcePath) => {
                // Filter out warnings from node_modules
                if (resourcePath.includes('node_modules')) {
                  return false
                }
                return true
              },
            },
          },
        ],
        enforce: 'pre',
      })
    }
    
    return config
  },
  
  // Enable experimental features for better development experience
  experimental: {
    // Enable turbopack for faster builds (optional)
    // turbo: dev,
    
    // Better error handling
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Ignore TypeScript errors during build (for development)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Ignore ESLint errors during build (for development)
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig