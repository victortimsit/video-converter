/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*", // Apply these headers to all routes
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp", // or "credentialless"
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
