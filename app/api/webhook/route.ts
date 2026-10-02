import { PRICE_ORE, decodeLetter } from "@/lib/letter"
import { getStripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
  if (!stripe || !secret) {
    return Response.json(
      { error: "Webhook är inte konfigurerad." },
      { status: 503 }
    )
  }

  const signature = req.headers.get("stripe-signature")
  if (!signature) {
    return Response.json({ error: "Saknar signatur." }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, secret)
  } catch {
    return Response.json({ error: "Ogiltig signatur." }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const payload = session.metadata?.d ?? ""
    const paid =
      session.payment_status === "paid" &&
      session.currency === "sek" &&
      session.amount_total === PRICE_ORE &&
      Boolean(decodeLetter(payload))
    return Response.json({ received: true, fulfilled: paid })
  }

  return Response.json({ received: true })
}
