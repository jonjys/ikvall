"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PLAY_MS, Sequence } from "@/components/sequence"
import { cn } from "cn"
import { useDraft } from "@/lib/draft"
import {
  LIMITS,
  MOODS,
  PRICE_KR,
  problem,
  type Letter,
  type Mood,
} from "@/lib/letter"
import type { StripeMode } from "@/lib/stripe"

const field =
  "h-auto rounded-none border-0 bg-transparent px-0 shadow-none ring-0 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"

export function Composer({ mode }: { mode: StripeMode }) {
  const [letter, setLetter] = useDraft()
  const [phase, setPhase] = useState<"edit" | "play" | "done">("edit")
  const [playId, setPlayId] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (phase === "edit") return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPhase("edit")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase])

  useEffect(() => {
    if (phase !== "play") return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timer = window.setTimeout(
      () => setPhase("done"),
      reduced ? 400 : PLAY_MS[letter.mood]
    )
    return () => window.clearTimeout(timer)
  }, [phase, playId, letter.mood])

  function update<K extends keyof Letter>(key: K, value: Letter[K]) {
    setNotice(null)
    setLetter((current) => ({ ...current, [key]: value }))
  }

  function play() {
    const issue = problem(letter)
    if (issue) {
      setNotice(issue)
      return
    }
    setPlayId((value) => value + 1)
    setPhase("play")
  }

  async function send() {
    const issue = problem(letter)
    if (issue) {
      setNotice(issue)
      return
    }
    setSending(true)
    setNotice(null)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(letter),
      })
      const data = (await response.json()) as { url?: string; error?: string }
      if (!response.ok || !data.url) {
        setNotice(data.error ?? "Betalningen gick inte att starta.")
        setSending(false)
        return
      }
      window.location.href = data.url
    } catch {
      setNotice("Nätverket svarade inte. Försök igen.")
      setSending(false)
    }
  }

  const accent =
    letter.mood === "fest"
      ? "bg-[#e6ff3d] text-black hover:bg-[#e6ff3d]/90"
      : letter.mood === "grattis"
        ? "bg-[#e7a04a] text-[#1a120c] hover:bg-[#e7a04a]/90"
        : "bg-white text-black hover:bg-white/90"

  const ghostLook =
    letter.mood === "fest"
      ? "font-fest text-[#ff2d7b] uppercase"
      : letter.mood === "grattis"
        ? "font-grattis text-[#e7a04a] italic"
        : "font-tyst tracking-wide text-white"

  const titleLook =
    letter.mood === "fest"
      ? "font-fest uppercase"
      : letter.mood === "grattis"
        ? "font-grattis normal-case italic"
        : "font-tyst text-4xl tracking-[0.18em] normal-case md:text-5xl"

  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-end overflow-hidden"
      >
        <p
          className={cn(
            "ghost-title max-w-[140%] px-4 pb-8 text-[22vw] leading-[0.78] tracking-tight opacity-[0.16]",
            ghostLook
          )}
        >
          {letter.title.trim() || "Ikväll"}
        </p>
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center justify-between">
          <p className="text-xs tracking-[0.42em]">IKVÄLL</p>
          <p className="text-sm text-white/70">{PRICE_KR} kr</p>
        </header>

        {mode === "off" ? (
          <p className="mt-6 text-sm text-[#e6ff3d]">
            Stripe är inte kopplat. Du kan spela kvällen, men ingen kan betala än.
          </p>
        ) : null}
        {mode === "test" ? (
          <p className="mt-6 text-sm text-[#e6ff3d]">
            Testläge. Kassan drar inga riktiga pengar.
          </p>
        ) : null}

        <div className="mt-[12vh] flex flex-1 flex-col">
          <div role="radiogroup" aria-label="Stämning" className="flex gap-2">
            {MOODS.map((mood) => (
              <Button
                key={mood}
                type="button"
                role="radio"
                aria-checked={letter.mood === mood}
                variant="outline"
                size="lg"
                className={cn(
                  "h-10 border-white/20 bg-transparent px-4 text-white capitalize hover:bg-white/10 hover:text-white dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10",
                  letter.mood === mood &&
                    "border-white bg-white text-black hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-white"
                )}
                onClick={() => update("mood", mood as Mood)}
              >
                {mood}
              </Button>
            ))}
          </div>

          <label className="mt-10 block">
            <span className="sr-only">Vad kvällen heter</span>
            <Input
              value={letter.title}
              maxLength={LIMITS.title}
              placeholder="Vad heter kvällen"
              autoComplete="off"
              className={cn(
                field,
                "text-5xl leading-none tracking-tight text-white placeholder:text-white/25 placeholder:normal-case md:text-6xl",
                titleLook
              )}
              onChange={(event) => update("title", event.target.value)}
            />
          </label>

          <label className="mt-6 block">
            <span className="sr-only">En mening</span>
            <Input
              value={letter.sentence}
              maxLength={LIMITS.sentence}
              placeholder="En mening."
              autoComplete="off"
              className={cn(
                field,
                "text-2xl text-white placeholder:text-white/25 md:text-3xl"
              )}
              onChange={(event) => update("sentence", event.target.value)}
            />
          </label>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              <span className="sr-only">Tid</span>
              <Input
                value={letter.when}
                maxLength={LIMITS.when}
                placeholder="Tid, om du vill"
                autoComplete="off"
                className={cn(field, "text-base text-white/90 placeholder:text-white/30")}
                onChange={(event) => update("when", event.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Plats</span>
              <Input
                value={letter.place}
                maxLength={LIMITS.place}
                placeholder="Plats, om du vill"
                autoComplete="off"
                className={cn(field, "text-base text-white/90 placeholder:text-white/30")}
                onChange={(event) => update("place", event.target.value)}
              />
            </label>
          </div>

          <p className="mt-6 min-h-6 text-sm text-[#e6ff3d]" role="status">
            {notice}
          </p>

          <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="h-12 border-white/20 bg-transparent px-5 text-base text-white hover:bg-white/10 hover:text-white"
              onClick={play}
            >
              Spela
            </Button>
            <Button
              type="button"
              size="lg"
              className={cn("h-12 px-5 text-base", accent)}
              disabled={sending}
              onClick={send}
            >
              {sending ? "Öppnar kassan…" : `Skicka · ${PRICE_KR} kr`}
            </Button>
          </div>

          <p className="mt-5 max-w-sm text-xs leading-relaxed text-white/45">
            Vi sparar inte meningen. Den följer med i länken. Stripe ser köpet
            så att just den meningen låses till just den betalningen.
          </p>
        </div>
      </div>

      {phase !== "edit" ? (
        <div className="fixed inset-0 z-40 bg-black" data-mood={letter.mood}>
          <Sequence key={playId} letter={letter} />
          <div className="absolute inset-x-0 top-0 z-50 flex justify-end px-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <Button
              type="button"
              variant="outline"
              className="border-white/20 bg-black text-white hover:bg-zinc-900 hover:text-white dark:bg-black dark:text-white dark:hover:bg-zinc-900"
              onClick={() => setPhase("edit")}
            >
              Stäng
            </Button>
          </div>
          {phase === "done" ? (
            <div className="absolute inset-x-0 bottom-0 z-50 flex flex-wrap justify-center gap-2 px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-black text-base text-white hover:bg-zinc-900 hover:text-white dark:bg-black dark:text-white dark:hover:bg-zinc-900"
                onClick={play}
              >
                Spela igen
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-black text-base text-white hover:bg-zinc-900 hover:text-white dark:bg-black dark:text-white dark:hover:bg-zinc-900"
                onClick={() => setPhase("edit")}
              >
                Ändra
              </Button>
              <Button
                type="button"
                size="lg"
                className={cn("h-12 text-base", accent)}
                disabled={sending}
                onClick={send}
              >
                {sending ? "Öppnar kassan…" : `Skicka · ${PRICE_KR} kr`}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
