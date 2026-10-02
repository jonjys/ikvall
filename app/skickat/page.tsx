import type { Metadata } from "next"
import Link from "next/link"

import { CopyBlock } from "@/components/copy-block"
import { StatusScreen } from "@/components/status-screen"
import { PRICE_ORE, decodeLetter } from "@/lib/letter"
import { siteOrigin } from "@/lib/origin"
import { classifyPayment } from "@/lib/payment"
import { signPayload } from "@/lib/sign"
import { getStripe, stripeMode } from "@/lib/stripe"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Skickad",
  robots: { index: false, follow: false },
}

export default async function SentPage(props: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await props.searchParams

  if (!sessionId) {
    return (
      <StatusScreen
        title="Ingen betalning att visa."
        body="Länken skapas först när kassan är betald. Gå tillbaka och skicka kvällen igen."
      />
    )
  }

  const stripe = getStripe()
  if (!stripe) {
    return (
      <StatusScreen
        title="Stripe är inte kopplat."
        body="Betalningen kan inte läsas utan en hemlig nyckel."
      />
    )
  }

  let payload = ""
  let verdict: ReturnType<typeof classifyPayment> = "unpaid"
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    })
    const intent = session.payment_intent
    const fromIntent =
      intent && typeof intent !== "string" ? (intent.metadata?.d ?? "") : ""
    payload = session.metadata?.d || fromIntent
    verdict = classifyPayment({
      currency: session.currency,
      amountTotal: session.amount_total,
      paymentStatus: session.payment_status,
      expectedAmount: PRICE_ORE,
    })
  } catch {
    return (
      <StatusScreen
        title="Betalningen hittades inte."
        body="Sessionen finns inte, eller så hör den inte till det här kontot."
      />
    )
  }

  if (verdict === "amount") {
    return (
      <StatusScreen
        title="Beloppet var inte 29 kr."
        body="Länken skapas bara för en betalning på 29 kronor. Inget annat belopp skickar kvällen."
      />
    )
  }

  if (verdict === "pending") {
    return (
      <StatusScreen
        title="Betalningen är inte klar än."
        body="Ladda om sidan om en stund. Länken skapas först när pengarna är dragna."
      />
    )
  }

  if (verdict !== "paid") {
    return (
      <StatusScreen
        title="Betalningen är inte klar."
        body="Om du avbröt drogs inga pengar. Kvällen ligger kvar där du skrev den."
      />
    )
  }

  const letter = decodeLetter(payload)
  if (!letter) {
    return (
      <StatusScreen
        title="Kvällen saknas i betalningen."
        body="Köpet gick igenom, men meningen kunde inte läsas. Hör av dig med kvitto så vi löser länken."
      />
    )
  }

  let signature = ""
  try {
    signature = signPayload(payload)
  } catch {
    return (
      <StatusScreen
        title="Länken kunde inte signeras."
        body="Betalningen är gjord, men SIGNING_SECRET saknas på servern. Sätt den och ladda om den här sidan."
      />
    )
  }

  const origin = await siteOrigin()
  const path = `/o?d=${encodeURIComponent(payload)}&s=${encodeURIComponent(signature)}`
  const url = `${origin}${path}`
  const share = `Öppna när du har en minut.\n${url}`

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-between px-6 py-8">
      <p className="text-xs tracking-[0.42em] text-white/70">IKVÄLL</p>
      <div>
        <h1 className="max-w-[10ch] text-5xl leading-[0.92] font-medium tracking-tight sm:text-7xl">
          Den är skickad.
        </h1>
        <p className="mt-6 max-w-sm text-lg text-white/70">
          Kopiera länken nu. Vi sparar den inte. Ladda om sidan om du behöver den igen, så länge adressen finns kvar.
        </p>
        <div className="mt-8">
          <CopyBlock url={url} share={share} test={stripeMode() === "test"} />
        </div>
        <Link href={path} className="mt-8 inline-block text-sm text-white/70 underline underline-offset-4">
          Spela den
        </Link>
      </div>
      <Link href="/" className="text-sm text-white/50">
        Gör en till
      </Link>
    </main>
  )
}
