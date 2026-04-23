import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS_TO_SEED = [
  {
    name: "The Reality Check",
    price: "$0",
    features: ["3-point roast summary", "Conversion score", "1 fix preview"],
    buttonLabel: "Get Started",
    buttonStyle: "outline",
    recommended: false,
    monthlyAudits: 18, // 15 + 3
    enabled: true,
  },
  {
    name: "The Actionable Fix",
    price: "$19",
    features: ["Full UX/UI audit", "Rewritten hero copy", "Copy-paste code fixes"],
    buttonLabel: "Fix My Page",
    buttonStyle: "primary",
    recommended: true,
    monthlyAudits: 40, // 30 + 10
    enabled: true,
  },
  {
    name: "The Agency Engine",
    price: "$49",
    features: ["Unlimited audits", "White-label PDF reports", "API access"],
    buttonLabel: "Go Pro",
    buttonStyle: "outline",
    recommended: false,
    monthlyAudits: 230, // 30 + 200
    enabled: true,
  },
];

async function main() {
  console.log("🚀 Starting plans seeding...");

  // Optional: clear existing plans if you want a clean slate
  // await prisma.plan.deleteMany();

  for (const plan of PLANS_TO_SEED) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: plan.name },
    });

    if (!existingPlan) {
      await prisma.plan.create({
        data: plan,
      });
      console.log(`✅ Seeded plan: ${plan.name}`);
    } else {
      console.log(`⏭️  Plan already exists, skipping: ${plan.name}`);
    }
  }

  console.log("🎉 All plans seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
