/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      os: false,
    };
    
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
    
    return config;
  },
  // Use either one of these, not both:
  // Option 1: For App Router (Next.js 13+)
  experimental: {
    serverComponentsExternalPackages: ['@tensorflow/tfjs', '@tensorflow-models/facemesh'],
  },
  
  // Option 2: For Pages Router or if Option 1 causes issues
//   transpilePackages: ['@tensorflow/tfjs', '@tensorflow-models/facemesh'],
}

module.exports = nextConfig