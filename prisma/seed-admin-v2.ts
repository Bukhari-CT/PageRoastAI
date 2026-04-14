import { auth } from "../lib/auth";
import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";

// Manually load .env for the standalone script
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        process.env[match[1]] = (match[2] || "").trim().replace(/^["']|["']$/g, "");
      }
    });
  }
}

loadEnv();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file.");
    process.exit(1);
  }

  console.log(`🚀 Creating admin user via Better Auth API: ${email}...`);

  try {
    // 0. Delete existing user if any to start fresh
    await prisma.user.delete({ where: { email } }).catch(() => {});
    
    // 1. Try to create the user via Better Auth API
    // This ensures Better Auth's internal hashing and validation are used
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: "Admin User",
        // @ts-ignore - custom fields
        firstName: "Admin",
        lastName: "User",
      },
    }).catch(async (e) => {
        // If user already exists, that's fine, we'll just update it
        if (e.message?.includes("already exists") || e.status === 400) {
            console.log("User already exists, proceeding to update roles...");
            return null;
        }
        throw e;
    });

    // 2. Update user to be Admin and Email Verified
    await prisma.user.update({
      where: { email },
      data: {
        isAdmin: true,
        emailVerified: true,
      },
    });

    console.log("✅ Admin user created/updated successfully!");
  } catch (error: any) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

main().finally(async () => {
    // Clean up
});
