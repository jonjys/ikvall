"use client"

import { Button } from "@/components/ui/button"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-between px-6 py-8">
      <p className="text-xs tracking-[0.42em] text-white/70">IKVÄLL</p>
      <div>
        <h1 className="max-w-[12ch] text-5xl leading-[0.92] font-medium tracking-tight sm:text-7xl">
          Något gick sönder.
        </h1>
        <p className="mt-6 max-w-sm text-lg text-white/70">
          Kvällen är inte borta. Försök igen.
        </p>
      </div>
      <Button type="button" size="lg" className="h-12 w-fit px-5 text-base" onClick={reset}>
        Försök igen
      </Button>
    </main>
  )
}
