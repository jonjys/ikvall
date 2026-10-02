import { Composer } from "@/components/composer"
import { stripeMode } from "@/lib/stripe"

export default function HomePage() {
  return <Composer mode={stripeMode()} />
}
