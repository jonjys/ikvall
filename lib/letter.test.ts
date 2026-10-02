import assert from "node:assert/strict"
import test from "node:test"

import { decodeLetter, encodeLetter, normalize, problem, type Letter } from "./letter.ts"
import { signPayload, verifyPayload } from "./sign.ts"

const sample: Letter = {
  title: "Efterfesten",
  sentence: "Kom som du är, stanna tills det ljusnar.",
  when: "lördag 23",
  place: "hos Mira",
  mood: "fest",
}

test("en giltig kväll kan kodas och läsas tillbaka", () => {
  const encoded = encodeLetter(sample)
  assert.deepEqual(decodeLetter(encoded), sample)
})

test("tomma fält stoppas innan någon länk finns", () => {
  assert.equal(problem({ ...sample, title: "  " }), "Skriv vad kvällen heter.")
  assert.equal(normalize({ ...sample, sentence: "" }), null)
})

test("en ändrad mening gör signaturen ogiltig", () => {
  process.env.SIGNING_SECRET = "test-secret-som-ar-tillrackligt-langt"
  const encoded = encodeLetter(sample)
  const signature = signPayload(encoded)
  assert.equal(verifyPayload(encoded, signature), true)

  const tampered = encodeLetter({ ...sample, sentence: "En annan mening." })
  assert.equal(verifyPayload(tampered, signature), false)
  assert.equal(verifyPayload(encoded, signature.slice(0, -2) + "aa"), false)
})
