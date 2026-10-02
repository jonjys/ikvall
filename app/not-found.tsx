import { StatusScreen } from "@/components/status-screen"

export default function NotFound() {
  return (
    <StatusScreen
      title="Den sidan finns inte."
      body="Kvällen bor på första sidan, eller i en länk någon skickat."
      action="Till första sidan"
    />
  )
}
