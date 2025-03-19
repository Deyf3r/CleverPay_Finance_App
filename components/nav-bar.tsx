"use client"

import Link from "next/link"
import { WalletIcon, BrainCircuitIcon, Settings } from "lucide-react"
import { useSettings } from "@/context/settings-context"

export default function NavBar() {
  const { translate } = useSettings()

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <WalletIcon className="h-6 w-6" />
          <span>{translate("app.name")}</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {translate("nav.overview")}
          </Link>
          <Link
            href="/transactions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {translate("nav.transactions")}
          </Link>
          <Link
            href="/ai-insights"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
          >
            <BrainCircuitIcon className="h-4 w-4 mr-1" />
            {translate("nav.ai_insights")}
          </Link>
          <Link
            href="/accounts"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {translate("nav.accounts")}
          </Link>
          <Link
            href="/settings"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center"
          >
            <Settings className="h-4 w-4 mr-1" />
            {translate("nav.settings")}
          </Link>
        </nav>
      </div>
    </div>
  )
}

