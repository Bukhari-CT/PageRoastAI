import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

/**
 * Simple .env loader to avoid extra dependencies
 */
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        // Remove quotes
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
}

loadEnv();

// Use DIRECT_URL for seeding if available to bypass connection poolers
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file.");
    console.log("Available environment variables found:", Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASS')));
    process.exit(1);
  }

  console.log(`🚀 Seeding admin user: ${adminEmail}...`);

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const selfCheck = await bcrypt.compare(adminPassword, hashedPassword);
  console.log(`🔍 Hashing self-check: ${selfCheck ? "PASSED" : "FAILED"}`);

  if (!selfCheck) {
    console.error("❌ Hashing verification failed internally.");
    process.exit(1);
  }

  try {
    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        isAdmin: true,
        emailVerified: true,
      },
      create: {
        email: adminEmail,
        name: "Admin User",
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
        emailVerified: true,
      },
    });

    // 2. Clean up any stale "email-password" account (wrong provider ID from old seeds)
    await prisma.account.deleteMany({
      where: {
        userId: user.id,
        providerId: "email-password",
      },
    });

    // 3. Upsert Account with correct "credential" provider (what Better Auth uses internally)
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: adminEmail,
        },
      },
      update: {
        password: hashedPassword,
      },
      create: {
        userId: user.id,
        providerId: "credential",
        accountId: adminEmail,
        password: hashedPassword,
      },
    });

    console.log("✅ Admin user seeded successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
