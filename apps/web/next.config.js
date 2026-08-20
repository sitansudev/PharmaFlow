/** @type {import("next").NextConfig} */
const nextConfig = {
  distDir: ".next-new",

  output: "standalone",

  allowedDevOrigins: [
    "127.0.0.1",
  ],
};

export default nextConfig;