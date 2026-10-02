import { headers } from "next/headers"

import { deploymentOrigin } from "@/lib/site"

function firstHeader(value: string | null): string | null {
  const first = value?.split(",")[0]?.trim()
  return first || null
}

function protoFor(host: string, forwarded: string | null): string {
  if (forwarded) return forwarded
  if (host.startsWith("localhost") || host.startsWith("127.")) return "http"
  return "https"
}

export function originFromRequest(req: Request): string {
  const configured = deploymentOrigin()
  if (process.env.NEXT_PUBLIC_SITE_URL && configured) return configured
  const host = firstHeader(req.headers.get("x-forwarded-host") ?? req.headers.get("host"))
  if (!host) {
    if (configured) return configured
    throw new Error("Saknar host.")
  }
  const proto = protoFor(host, firstHeader(req.headers.get("x-forwarded-proto")))
  return `${proto}://${host}`
}

export async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const configured = deploymentOrigin()
    if (configured) return configured
  }
  const headerList = await headers()
  const host = firstHeader(headerList.get("x-forwarded-host") ?? headerList.get("host"))
  if (!host) {
    const configured = deploymentOrigin()
    if (configured) return configured
    throw new Error("Saknar host.")
  }
  const proto = protoFor(host, firstHeader(headerList.get("x-forwarded-proto")))
  return `${proto}://${host}`
}
