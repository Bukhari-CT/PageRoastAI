// /home/bukhari/work/PageRoastAI/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

/**
 * Global singleton pattern for PrismaClient
 * to prevent multiple instances in development.
 */
const prismaClientSingleton = () => {
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
