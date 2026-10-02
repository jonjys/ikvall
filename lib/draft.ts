"use client"

import { useCallback, useSyncExternalStore } from "react"

import { DRAFT_KEY, emptyLetter, isMood, type Letter } from "@/lib/letter"

const serverLetter = emptyLetter()
let cachedRaw: string | null = null
let cachedLetter: Letter = serverLetter
const listeners = new Set<() => void>()

function parseDraft(raw: string | null): Letter {
  if (!raw) return serverLetter
  try {
    const parsed = JSON.parse(raw) as Partial<Letter>
    if (!isMood(parsed.mood)) return serverLetter
    return {
      title: typeof parsed.title === "string" ? parsed.title : "",
      sentence: typeof parsed.sentence === "string" ? parsed.sentence : "",
      when: typeof parsed.when === "string" ? parsed.when : "",
      place: typeof parsed.place === "string" ? parsed.place : "",
      mood: parsed.mood,
    }
  } catch {
    return serverLetter
  }
}

function readDraft(): Letter {
  const raw = localStorage.getItem(DRAFT_KEY)
  if (raw === cachedRaw) return cachedLetter
  cachedRaw = raw
  cachedLetter = parseDraft(raw)
  return cachedLetter
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)
  return () => listeners.delete(onStoreChange)
}

export function useDraft(): [Letter, (next: Letter | ((current: Letter) => Letter)) => void] {
  const letter = useSyncExternalStore(subscribe, readDraft, () => serverLetter)
  const setLetter = useCallback((next: Letter | ((current: Letter) => Letter)) => {
    const resolved = typeof next === "function" ? next(readDraft()) : next
    const raw = JSON.stringify(resolved)
    cachedRaw = raw
    cachedLetter = resolved
    localStorage.setItem(DRAFT_KEY, raw)
    listeners.forEach((listener) => listener())
  }, [])
  return [letter, setLetter]
}
