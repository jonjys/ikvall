import Stripe from "stripe"

import { PRICE_ORE } from "@/lib/letter"

export type StripeMode = "live" | "test" | "off"

const LOOKUP_KEY = "ikvall"

export class PriceMismatchError extends Error {
  constructor() {
    super("STRIPE_PRICE_ID måste vara ett aktivt pris på 29 SEK.")
    this.name = "PriceMismatchError"
  }
}

export function stripeKey(): string {
  return (process.env.STRIPE_SECRET_KEY ?? "").trim().replace(/^["']|["']$/g, "")
}

export function stripeMode(): StripeMode {
  const key = stripeKey()
  if (!key) return "off"
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live"
  return "test"
}

export function getStripe(): Stripe | null {
  const key = stripeKey()
  if (!key) return null
  return new Stripe(key)
}

export async function ensureNightPrice(stripe: Stripe): Promise<string> {
  const configured = process.env.STRIPE_PRICE_ID?.trim()
  if (configured) {
    const price = await stripe.prices.retrieve(configured)
    if (!price.active || price.unit_amount !== PRICE_ORE || price.currency !== "sek") {
      throw new PriceMismatchError()
    }
    return price.id
  }

  const found = await findNightPrice(stripe)
  if (found) return found

  try {
    const created = await stripe.prices.create({
      currency: "sek",
      unit_amount: PRICE_ORE,
      lookup_key: LOOKUP_KEY,
      transfer_lookup_key: true,
      tax_behavior: "inclusive",
      product_data: {
        name: "IKVÄLL",
        metadata: { app: "ikvall" },
      },
    })
    return created.id
  } catch (error) {
    const again = await findNightPrice(stripe)
    if (again) return again
    throw error
  }
}

async function findNightPrice(stripe: Stripe): Promise<string | null> {
  const listed = await stripe.prices.list({
    lookup_keys: [LOOKUP_KEY],
    active: true,
    limit: 1,
  })
  const price = listed.data.find(
    (item) => item.active && item.unit_amount === PRICE_ORE && item.currency === "sek"
  )
  return price?.id ?? null
}
