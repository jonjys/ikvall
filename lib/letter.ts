export const MOODS = ["fest", "tyst", "grattis"] as const

export type Mood = (typeof MOODS)[number]

export type Letter = {
  title: string
  sentence: string
  when: string
  place: string
  mood: Mood
}

export const LIMITS = {
  title: 48,
  sentence: 160,
  when: 40,
  place: 48,
} as const

export const PRICE_KR = 29
export const PRICE_ORE = 2900
export const DRAFT_KEY = "ikvall-draft"

export function isMood(value: unknown): value is Mood {
  return value === "fest" || value === "tyst" || value === "grattis"
}

export function emptyLetter(): Letter {
  return { title: "", sentence: "", when: "", place: "", mood: "fest" }
}

export function problem(input: Partial<Letter>): string | null {
  const title = input.title?.trim() ?? ""
  const sentence = input.sentence?.trim() ?? ""
  const when = input.when?.trim() ?? ""
  const place = input.place?.trim() ?? ""

  if (!isMood(input.mood)) return "Välj en stämning."
  if (!title) return "Skriv vad kvällen heter."
  if (title.length > LIMITS.title) return "Namnet är för långt."
  if (!sentence) return "Skriv en mening."
  if (sentence.length > LIMITS.sentence) return "Meningen är för lång."
  if (when.length > LIMITS.when) return "Tiden är för lång."
  if (place.length > LIMITS.place) return "Platsen är för lång."
  return null
}

export function normalize(input: Partial<Letter>): Letter | null {
  if (problem(input)) return null
  return {
    title: input.title!.trim(),
    sentence: input.sentence!.trim(),
    when: input.when?.trim() ?? "",
    place: input.place?.trim() ?? "",
    mood: input.mood as Mood,
  }
}

function canonical(letter: Letter): string {
  return JSON.stringify({
    title: letter.title,
    sentence: letter.sentence,
    when: letter.when,
    place: letter.place,
    mood: letter.mood,
  })
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function fromBase64Url(value: string): string {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4))
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeLetter(letter: Letter): string {
  return toBase64Url(new TextEncoder().encode(canonical(letter)))
}

export function decodeLetter(payload: string): Letter | null {
  if (!payload || payload.length > 2000) return null
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(payload))
    if (!parsed || typeof parsed !== "object") return null
    return normalize(parsed as Partial<Letter>)
  } catch {
    return null
  }
}

export function metaLine(letter: Letter): string {
  return [letter.when, letter.place].filter(Boolean).join("   ·   ")
}
