export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { AppDataSource } = await import(
      "@/src/Infrastructure/Database/DBConnection"
    );
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await import("@/src/Infrastructure/DIContainer/Container");
  }
}
