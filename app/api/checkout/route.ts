import { originFromRequest } from "@/lib/origin"
import { encodeLetter, normalize, type Letter } from "@/lib/letter"
import { explainStripeFailure } from "@/lib/payment"
import { signPayload } from "@/lib/sign"
import { PriceMismatchError, ensureNightPrice, getStripe, stripeMode } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    signPayload("ikvall")
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("SIGNING_SECRET")
        ? error.message
        : "Länken kunde inte låsas. Ingen betalning startades."
    return Response.json({ error: message }, { status: 503 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return Response.json(
      { error: "Stripe är inte kopplat. Ingen betalning startades." },
      { status: 503 }
    )
  }

  let body: Partial<Letter>
  try {
    body = (await req.json()) as Partial<Letter>
  } catch {
    return Response.json({ error: "Kvällen gick inte att läsa." }, { status: 400 })
  }

  const letter = normalize(body)
  if (!letter) {
    return Response.json(
      { error: "Skriv vad kvällen heter, och en mening." },
      { status: 400 }
    )
  }

  const payload = encodeLetter(letter)
  if (payload.length > 500) {
    return Response.json({ error: "Meningen är för lång." }, { status: 400 })
  }

  let origin = ""
  try {
    origin = originFromRequest(req)
  } catch {
    return Response.json({ error: "Adressen till sidan saknas." }, { status: 500 })
  }

  if (stripeMode() === "live" && !origin.startsWith("https://")) {
    return Response.json(
      {
        error:
          "Riktiga betalningar kräver en https-adress. Sätt NEXT_PUBLIC_SITE_URL.",
      },
      { status: 400 }
    )
  }

  try {
    const price = await ensureNightPrice(stripe)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "sv",
      line_items: [{ price, quantity: 1 }],
      metadata: { d: payload },
      payment_intent_data: {
        description: "IKVÄLL",
        metadata: { d: payload },
      },
      custom_text: {
        submit: {
          message: "29 kr för en länk. Den visas direkt efter betalningen.",
        },
      },
      success_url: `${origin}/skickat?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/avbrutet`,
    })

    if (!session.url) {
      return Response.json(
        { error: "Kassan svarade utan en adress." },
        { status: 502 }
      )
    }

    return Response.json({ url: session.url })
  } catch (error) {
    if (error instanceof PriceMismatchError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: explainStripeFailure(error) }, { status: 502 })
  }
}
