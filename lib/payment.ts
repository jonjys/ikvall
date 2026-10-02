export type PaymentVerdict = "paid" | "pending" | "amount" | "unpaid"

export function classifyPayment(input: {
  currency: string | null | undefined
  amountTotal: number | null | undefined
  paymentStatus: string | null | undefined
  expectedAmount: number
}): PaymentVerdict {
  if (input.currency !== "sek" || input.amountTotal !== input.expectedAmount) {
    return "amount"
  }
  if (input.paymentStatus === "paid") return "paid"
  if (input.paymentStatus === "unpaid") return "pending"
  return "unpaid"
}

export function explainStripeFailure(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Betalningen gick inte att starta."
  }
  const { type, code, message } = error as {
    type?: string
    code?: string
    message?: string
  }
  if (type === "StripeAuthenticationError" || code === "api_key_expired") {
    return "Stripe-nyckeln nekades. Kontrollera STRIPE_SECRET_KEY."
  }
  if (code === "resource_missing") {
    return "Något saknas i Stripe. Om du satt STRIPE_PRICE_ID, ta bort den så skapas 29 kr."
  }
  const text = message ?? ""
  if (/https?:\/\//i.test(text) && /livemode|https/i.test(text)) {
    return "Riktiga betalningar kräver en https-adress. Sätt NEXT_PUBLIC_SITE_URL."
  }
  if (/currency/i.test(text)) {
    return "Kontot kan inte ta betalt i kronor. Aktivera SEK i Stripe."
  }
  if (text) return text
  return "Betalningen gick inte att starta."
}
