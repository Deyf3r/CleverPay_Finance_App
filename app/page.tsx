"use client"

import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, HomeIcon, CreditCardIcon, BrainCircuitIcon } from "lucide-react"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import FinanceChart from "@/components/finance-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from "date-fns"

export default function Home() {
  const { state, getTotalBalance, getTotalIncome, getTotalExpenses, getSavingsRate } = useFinance()
  const { formatCurrency, translate } = useSettings()

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM d, yyyy")
  }

  // Get the most recent transactions
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("dashboard.title")}</h2>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/ai-insights">
                <BrainCircuitIcon className="mr-2 h-4 w-4" />
                {translate("nav.ai_insights")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/add-transaction">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                {translate("transactions.add")}
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{translate("dashboard.total_balance")}</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalBalance())}</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.across_accounts")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{translate("dashboard.income")}</CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{formatCurrency(getTotalIncome())}</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.total_income")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{translate("dashboard.expenses")}</CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500">{formatCurrency(getTotalExpenses())}</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.total_expenses")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{translate("dashboard.savings_rate")}</CardTitle>
              <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSavingsRate()}%</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.of_income")}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{translate("dashboard.monthly_overview")}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <FinanceChart />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>{translate("dashboard.recent_transactions")}</CardTitle>
              <CardDescription>{translate("dashboard.latest_activities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div className="flex items-center" key={transaction.id}>
                      <div className="mr-4 rounded-full bg-primary/10 p-2">
                        {transaction.category === "housing" ? (
                          <HomeIcon className="h-4 w-4 text-primary" />
                        ) : transaction.type === "income" ? (
                          <DollarSignIcon className="h-4 w-4 text-primary" />
                        ) : (
                          <CreditCardIcon className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                      <div
                        className={`font-medium ${
                          transaction.type === "income" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">{translate("dashboard.no_transactions")}</div>
                )}

                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/transactions">{translate("dashboard.view_all")}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

