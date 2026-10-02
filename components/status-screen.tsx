import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function StatusScreen({
  title,
  body,
  href = "/",
  action = "Tillbaka",
}: {
  title: string
  body: string
  href?: string
  action?: string
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col justify-between px-6 py-8">
      <p className="text-xs tracking-[0.42em] text-white/70">IKVÄLL</p>
      <div>
        <h1 className="max-w-[12ch] text-5xl leading-[0.92] font-medium tracking-tight sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-sm text-lg leading-relaxed text-white/70">{body}</p>
      </div>
      <Link
        href={href}
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-fit px-5 text-base")}
      >
        {action}
      </Link>
    </main>
  )
}
