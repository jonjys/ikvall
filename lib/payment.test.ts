import assert from "node:assert/strict"
import test from "node:test"

import { classifyPayment, explainStripeFailure } from "./payment.ts"

test("bara 29 kronor som är betalda låser upp länken", () => {
  assert.equal(
    classifyPayment({
      currency: "sek",
      amountTotal: 2900,
      paymentStatus: "paid",
      expectedAmount: 2900,
    }),
    "paid"
  )
  assert.equal(
    classifyPayment({
      currency: "sek",
      amountTotal: 2900,
      paymentStatus: "unpaid",
      expectedAmount: 2900,
    }),
    "pending"
  )
  assert.equal(
    classifyPayment({
      currency: "usd",
      amountTotal: 2900,
      paymentStatus: "paid",
      expectedAmount: 2900,
    }),
    "amount"
  )
  assert.equal(
    classifyPayment({
      currency: "sek",
      amountTotal: 100,
      paymentStatus: "paid",
      expectedAmount: 2900,
    }),
    "amount"
  )
})

test("stripe-fel blir begripliga", () => {
  assert.match(
    explainStripeFailure({ type: "StripeAuthenticationError", message: "Invalid API Key" }),
    /nyckeln nekades/
  )
  assert.match(
    explainStripeFailure({ code: "resource_missing", message: "No such price" }),
    /STRIPE_PRICE_ID/
  )
  assert.equal(explainStripeFailure(null), "Betalningen gick inte att starta.")
})
