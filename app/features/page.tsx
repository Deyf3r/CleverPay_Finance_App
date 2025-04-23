"use client"

import { useAuth } from "@/context/auth-context"
import { AdvancedAnalytics } from "@/components/advanced-analytics"
import { AIInsights } from "@/components/ai-insights"
import { DataExport } from "@/components/data-export"
import { PlanFeaturesComparison } from "@/components/plan-features-comparison"
import { TransactionsList } from "@/components/transactions-list"
import NavBar from "@/components/nav-bar"
import { Badge } from "@/components/ui/badge"
import { Crown, Star, Sparkles } from "lucide-react"

// Datos de ejemplo para las transacciones
const sampleTransactions = [
  {
    id: "1",
    type: "expense" as const,
    amount: 45.99,
    description: "Compra en supermercado",
    category: "Alimentación",
    date: "2023-05-15",
    account: "Cuenta principal",
  },
  {
    id: "2",
    type: "expense" as const,
    amount: 12.5,
    description: "Taxi",
    category: "Transporte",
    date: "2023-05-14",
    account: "Cuenta principal",
  },
  {
    id: "3",
    type: "income" as const,
    amount: 1500,
    description: "Salario",
    category: "Salario",
    date: "2023-05-10",
    account: "Cuenta principal",
  },
  {
    id: "4",
    type: "expense" as const,
    amount: 35.0,
    description: "Cena restaurante",
    category: "Alimentación",
    date: "2023-05-08",
    account: "Tarjeta de crédito",
  },
  {
    id: "5",
    type: "expense" as const,
    amount: 9.99,
    description: "Suscripción streaming",
    category: "Entretenimiento",
    date: "2023-05-05",
    account: "Tarjeta de crédito",
  },
  {
    id: "6",
    type: "expense" as const,
    amount: 120.0,
    description: "Factura electricidad",
    category: "Servicios",
    date: "2023-05-03",
    account: "Cuenta principal",
  },
  {
    id: "7",
    type: "income" as const,
    amount: 250.0,
    description: "Reembolso seguro",
    category: "Otros",
    date: "2023-05-02",
    account: "Cuenta principal",
  },
  {
    id: "8",
    type: "expense" as const,
    amount: 65.5,
    description: "Ropa",
    category: "Ropa",
    date: "2023-04-28",
    account: "Tarjeta de crédito",
  },
  {
    id: "9",
    type: "expense" as const,
    amount: 42.0,
    description: "Gasolina",
    category: "Transporte",
    date: "2023-04-25",
    account: "Cuenta principal",
  },
  {
    id: "10",
    type: "expense" as const,
    amount: 15.99,
    description: "Libro",
    category: "Educación",
    date: "2023-04-20",
    account: "Tarjeta de crédito",
  },
]

export default function FeaturesPage() {
  const { user } = useAuth()
  const userPlan = user?.subscriptionPlan || "free"

  const getPlanBadge = () => {
    switch (userPlan) {
      case "free":
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/50"
          >
            <Star className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Plan Free
          </Badge>
        )
      case "pro":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50"
          >
            <Crown className="h-3.5 w-3.5 mr-1 text-blue-500" />
            Plan Pro
          </Badge>
        )
      case "premium":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-500" />
            Plan Premium
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-900/50"
          >
            <Star className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Plan Free
          </Badge>
        )
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <NavBar />
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/50">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Características por Plan
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Explora las diferentes características disponibles según tu plan de suscripción
            </p>
          </div>
          <div>{getPlanBadge()}</div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PlanFeaturesComparison />

          <div className="space-y-6">
            <AdvancedAnalytics />
            <AIInsights />
            <DataExport />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Transacciones
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            El número de transacciones que puedes gestionar depende de tu plan
          </p>

          <TransactionsList transactions={sampleTransactions} />
        </div>
      </div>
    </div>
  )
}
