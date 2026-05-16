import type { NextConfig } from "next";
import { config } from "./lib/config";

const nextConfig: NextConfig = {
  async headers() {
    const origin = config.CORS_ORIGIN ?? "*";
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: origin === "*" ? "false" : "true",
          },
          { key: "Access-Control-Allow-Origin", value: origin },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
