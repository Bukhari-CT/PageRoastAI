import "reflect-metadata";
import { DataSource } from "typeorm";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { UserModel } from "@models/UserModel";
import { SessionModel } from "@models/SessionModel";
import { AccountModel } from "@models/AccountModel";
import { VerificationModel } from "@models/VerificationModel";
import { generateId } from "@application/Shared/SharedUtils";

/**
 * Creates (or updates) a single administrator account from explicit
 * environment variables.
 *
 * This script deliberately seeds NOTHING else. It previously also created a
 * demo user and a paid "unlimited" account with passwords hardcoded in the
 * repository, which meant running it against production produced known-password
 * accounts — one of them on a paid plan.
 *
 * ADMIN_EMAIL and ADMIN_PASSWORD are read here rather than in the application's
 * environment schema, so they never need to exist in a running deployment.
 */

/** Minimal .env loader so the script has no extra dependency. */
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const envFile = fs.readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;

    const key = match[1];
    let value = match[2] || "";
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.substring(1, value.length - 1);
    }
    process.env[key] = value.trim();
  }
}

loadEnv();

const MIN_PASSWORD_LENGTH = 12;
const CREDENTIAL_PROVIDER_ID = "credential";

// Dedicated DataSource pointed at DIRECT_URL to bypass connection poolers.
const seedDataSource = new DataSource({
  type: "mysql",
  url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  entities: [UserModel, SessionModel, AccountModel, VerificationModel],
});

async function seedAdmin(email: string, password: string) {
  const userRepository = seedDataSource.getRepository(UserModel);
  const accountRepository = seedDataSource.getRepository(AccountModel);
  const hashedPassword = await bcrypt.hash(password, 10);

  let user = await userRepository.findOne({ where: { email } });

  if (user) {
    user.isAdmin = true;
    user.emailVerified = true;
    user = await userRepository.save(user);
  } else {
    user = await userRepository.save({
      id: generateId(),
      email,
      name: "Admin",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
      emailVerified: true,
      package: null,
    });
  }

  const existingCredential = await accountRepository.findOne({
    where: { providerId: CREDENTIAL_PROVIDER_ID, accountId: email },
  });

  if (existingCredential) {
    await accountRepository.update(
      { id: existingCredential.id },
      { password: hashedPassword }
    );
  } else {
    await accountRepository.save({
      id: generateId(),
      userId: user.id,
      providerId: CREDENTIAL_PROVIDER_ID,
      accountId: email,
      password: hashedPassword,
    });
  }

  console.log("✅ Admin account is ready.");
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error(
      "❌ ADMIN_EMAIL and ADMIN_PASSWORD must both be set before running this script."
    );
    process.exit(1);
  }

  if (adminPassword.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `❌ ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters. Refusing to seed a weak administrator password.`
    );
    process.exit(1);
  }

  // Guard against the placeholder shipped in .env.example ever reaching a real
  // database. Compared case-insensitively; the value itself is never printed.
  if (adminPassword.trim().toLowerCase() === "change-me-locally") {
    console.error(
      "❌ ADMIN_PASSWORD is still the example placeholder. Set a real password before seeding."
    );
    process.exit(1);
  }

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
    console.error(
      "❌ Refusing to seed against a production environment. Set ALLOW_PRODUCTION_SEED=true to override deliberately."
    );
    process.exit(1);
  }

  await seedDataSource.initialize();

  try {
    await seedAdmin(adminEmail, adminPassword);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exitCode = 1;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (seedDataSource.isInitialized) {
      await seedDataSource.destroy();
    }
  });
