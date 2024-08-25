/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // env: env,
  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
};

export default nextConfig;
