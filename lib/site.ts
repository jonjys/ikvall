export function deploymentOrigin(): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (configured) return configured
  const vercelHost = (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
  if (vercelHost) return `https://${vercelHost}`
  return null
}
