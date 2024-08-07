/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
  }
  
  export default nextConfig;