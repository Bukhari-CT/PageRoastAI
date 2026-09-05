export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getDataSource } = await import(
      "@/src/Infrastructure/Database/DBConnection"
    );
    // Warms the connection during boot. Requests that arrive before this
    // resolves share the same in-flight initialization rather than starting a
    // second one, so there is no race with the first database call.
    await getDataSource();
    await import("@/src/Infrastructure/DIContainer/Container");
  }
}
