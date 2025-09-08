import type { NextConfig } from "next";
import withPWA from "next-pwa";

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
}) as NextConfig;