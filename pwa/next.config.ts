/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAFunc = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Add Next.js options here as needed
};

// next-pwa types are not aligned with Next 15 yet; cast to any to avoid TS error.
// @ts-ignore
export default (withPWAFunc as any)(nextConfig) as NextConfig;
