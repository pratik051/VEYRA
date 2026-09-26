import dns from "node:dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Enforce IPv4-first DNS lookups across Node runtime (prevents IPv6 connection drops on cloud hosts like Render/Vercel)
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder("ipv4first");
  }
} catch {
  // Ignored on legacy engines
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(serverDir, "..");

// Load environment variables priority: .env.local > .env > root .env.local > root .env
dotenv.config({ path: path.resolve(serverDir, ".env.local") });
dotenv.config({ path: path.resolve(serverDir, ".env") });
dotenv.config({ path: path.resolve(rootDir, ".env.local") });
dotenv.config({ path: path.resolve(rootDir, ".env") });
dotenv.config();

export default process.env;
