import fs from "fs";
import path from "path";
import type { NextConfig } from "next";

// Load .env from project root so frontend gets the same vars as backend
const repoRoot =
  path.basename(process.cwd()) === "frontend"
    ? path.resolve(process.cwd(), "..")
    : process.cwd();
const envPath = path.join(repoRoot, ".env");
try {
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const raw = trimmed.slice(eq + 1).trim();
    const value = raw.replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
} catch {
  // .env at repo root is optional
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
