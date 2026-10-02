import type { Metadata } from "next"

import { Recipient } from "@/components/recipient"
import { StatusScreen } from "@/components/status-screen"
import { decodeLetter } from "@/lib/letter"
import { verifyPayload } from "@/lib/sign"

export const metadata: Metadata = {
  title: "En kväll till dig",
  description: "Någon har skickat en kväll. Öppna den.",
  openGraph: {
    title: "En kväll till dig",
    description: "Någon har skickat en kväll. Öppna den.",
  },
}

export default async function OpenPage(props: {
  searchParams: Promise<{ d?: string; s?: string }>
}) {
  const { d, s } = await props.searchParams

  if (!d && !s) {
    return (
      <StatusScreen
        title="Här finns ingen kväll."
        body="Om någon skickade en länk ska den innehålla både kvällen och en signatur."
        action="Gör en egen"
      />
    )
  }

  const letter = d ? decodeLetter(d) : null
  if (!d || !s || !letter || !verifyPayload(d, s)) {
    return (
      <StatusScreen
        title="Den här länken är inte skickad."
        body="Antingen är den ofullständig, eller så har någon ändrat den. Inget spelas upp."
        action="Gör en egen"
      />
    )
  }

  return <Recipient letter={letter} />
}
