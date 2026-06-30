import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://platform.linkedin.com https://static.licdn.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: https://img.youtube.com https://rambrij-uploads.s3.us-east-1.amazonaws.com",
      "font-src 'self' https://fonts.gstatic.com https://static.licdn.com",
      "connect-src 'self' https://*.amazonaws.com https://*.linkedin.com https://*.licdn.com https://api.microlink.io https://challenges.cloudflare.com",
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.linkedin.com https://docs.google.com https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "rambrij-uploads.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
    ],
  },
  // Bake env vars at build time so they are available in the Lambda runtime
  // (Amplify WEB_COMPUTE does not reliably pass env vars to the SSR Lambda)
  env: {
    AUTH_SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET ?? "",
    AUTH_TRUST_HOST: "true",
    AUTH_URL: process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "",
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL ?? "",
    APP_AWS_ACCESS_KEY_ID: process.env.APP_AWS_ACCESS_KEY_ID ?? "",
    APP_AWS_SECRET_ACCESS_KEY: process.env.APP_AWS_SECRET_ACCESS_KEY ?? "",
    APP_AWS_REGION: process.env.APP_AWS_REGION ?? "us-east-1",
    APP_S3_BUCKET: process.env.APP_S3_BUCKET ?? "rambrij-uploads",
    UPLOAD_PREFIX: process.env.UPLOAD_PREFIX ?? "local",
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
