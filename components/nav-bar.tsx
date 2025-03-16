import Link from "next/link"
import { WalletIcon } from "lucide-react"

export default function NavBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <WalletIcon className="h-6 w-6" />
          <span>FinanceTracker</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Overview
          </Link>
          <Link
            href="/transactions"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Transactions
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Accounts
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Settings
          </Link>
        </nav>
      </div>
    </div>
  )
}

