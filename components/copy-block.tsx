"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

export function CopyBlock({
  url,
  share,
  test,
}: {
  url: string
  share: string
  test: boolean
}) {
  const [copied, setCopied] = useState<"link" | "text" | null>(null)
  const [failed, setFailed] = useState(false)

  async function copy(value: string, which: "link" | "text") {
    setFailed(false)
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
    } catch {
      setCopied(null)
      setFailed(true)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm break-all text-white/80">{url}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="h-12 px-5 text-base"
          onClick={() => copy(url, "link")}
        >
          {copied === "link" ? "Länken är kopierad" : "Kopiera länken"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 border-white/20 bg-transparent px-5 text-base text-white hover:bg-white/10 hover:text-white"
          onClick={() => copy(share, "text")}
        >
          {copied === "text" ? "Texten är kopierad" : "Kopiera texten"}
        </Button>
      </div>
      {failed ? (
        <p className="text-sm text-[#e6ff3d]">
          Markera länken och kopiera den själv.
        </p>
      ) : (
        <p className="text-sm text-white/55">
          Öppna när du har en minut. Klistra in den raden där du skickar.
        </p>
      )}
      {test ? (
        <p className="text-sm text-[#e6ff3d]">
          Testläge. Det här köpet drog inga riktiga pengar.
        </p>
      ) : null}
    </div>
  )
}
