import type { Metadata } from "next"

import { StatusScreen } from "@/components/status-screen"

export const metadata: Metadata = {
  title: "Inte skickad",
}

export default function CancelledPage() {
  return (
    <StatusScreen
      title="Du skickade inte."
      body="Inget drogs. Kvällen ligger kvar i den här webbläsaren."
      action="Tillbaka till kvällen"
    />
  )
}
