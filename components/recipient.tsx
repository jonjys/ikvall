"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { PLAY_MS, Sequence } from "@/components/sequence"
import { cn } from "cn"
import type { Letter } from "@/lib/letter"

function subscribe() {
  return () => {}
}

export function Recipient({ letter }: { letter: Letter }) {
  const shown = useSyncExternalStore(subscribe, () => true, () => false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const timer = window.setTimeout(
      () => setDone(true),
      reduced ? 400 : PLAY_MS[letter.mood]
    )
    return () => window.clearTimeout(timer)
  }, [letter.mood])

  if (!shown) {
    return (
      <main className="grid min-h-dvh place-items-center bg-black px-6 text-white">
        <p className="text-sm tracking-[0.35em]">ÖPPNAR</p>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh bg-black">
      <Sequence key={letter.mood} letter={letter} />
      {done ? (
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 bg-white px-6 text-base text-black hover:bg-white/90"
            )}
          >
            Gör en egen
          </Link>
        </div>
      ) : null}
    </main>
  )
}
