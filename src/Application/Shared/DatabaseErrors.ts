const DUPLICATE_ENTRY_CODE = "ER_DUP_ENTRY";
const DUPLICATE_ENTRY_ERRNO = 1062;

export function isDuplicateEntryError(error: unknown): boolean {
  const candidates = [error, (error as { driverError?: unknown } | null)?.driverError];

  return candidates.some((candidate) => {
    const details = candidate as { code?: string; errno?: number } | null | undefined;
    return (
      details?.code === DUPLICATE_ENTRY_CODE || details?.errno === DUPLICATE_ENTRY_ERRNO
    );
  });
}
