import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

let fileSecret: string | null = null

function secret(): string {
  const fromEnv = process.env.SIGNING_SECRET?.trim()
  if (fromEnv && fromEnv.length >= 16) return fromEnv
  if (process.env.VERCEL === "1") {
    throw new Error("SIGNING_SECRET saknas. Ingen betalning startades.")
  }
  if (fileSecret) return fileSecret
  const file = path.join(process.cwd(), ".data", "signing-secret")
  try {
    const stored = readFileSync(file, "utf8").trim()
    if (stored.length >= 16) {
      fileSecret = stored
      return stored
    }
  } catch {
    // Filen finns inte än.
  }
  const created = randomBytes(32).toString("base64url")
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, created, { mode: 0o600 })
  fileSecret = created
  return created
}

export function signPayload(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url")
}

export function verifyPayload(payload: string, signature: string): boolean {
  if (!payload || !signature) return false
  try {
    const expected = signPayload(payload)
    const left = Buffer.from(expected)
    const right = Buffer.from(signature)
    if (left.length !== right.length) return false
    return timingSafeEqual(left, right)
  } catch {
    return false
  }
}
