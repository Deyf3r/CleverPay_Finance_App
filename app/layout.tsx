import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FinanceProvider } from "@/context/finance-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Track your income, expenses and financial goals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FinanceProvider>
          {children}
          <Toaster />
        </FinanceProvider>
      </body>
    </html>
  )
}



import './globals.css'