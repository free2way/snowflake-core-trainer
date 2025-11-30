/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // App router is enabled by default in Next.js 13+
  },
  images: {
    domains: [],
  },
  typescript: {
    // 忽略构建时的 TypeScript 错误
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
