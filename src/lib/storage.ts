import path from 'path'

// In production (Railway), STORAGE_PATH points to the persistent volume (e.g. /data).
// In development, files live inside public/ so Next.js serves them statically.
function getStorageRoot(): string {
  return process.env.STORAGE_PATH || path.join(process.cwd(), 'public')
}

export function getUploadsDir(subdir: 'images' | 'logos'): string {
  return path.join(getStorageRoot(), 'uploads', subdir)
}

// Resolve a stored path like /uploads/images/foo.png to an absolute filesystem path.
export function resolveStoredPath(storedPath: string): string {
  return path.join(getStorageRoot(), storedPath)
}

// Returns the DATABASE_URL-compatible path for Prisma.
// Used as fallback only — the env var DATABASE_URL takes precedence in schema.prisma.
export function getDbPath(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  return `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`
}
