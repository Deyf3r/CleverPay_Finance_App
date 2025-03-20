"use client"

import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  HomeIcon,
  CreditCardIcon,
  BrainCircuitIcon,
  BarChart4,
  PiggyBank,
  Calendar,
  Download,
} from "lucide-react"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import FinanceChart from "@/components/finance-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { ExportPDF } from "@/components/export-pdf"

export default function DashboardPage() {
  const { state, getTotalBalance, getTotalIncome, getTotalExpenses, getSavingsRate } = useFinance()
  const { formatCurrency, translate } = useSettings()

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM d, yyyy")
  }

  // Get the most recent transactions
  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4)

  // Calcular estadísticas del mes actual
  const currentDate = new Date()
  const startOfCurrentMonth = startOfMonth(currentDate)
  const endOfCurrentMonth = endOfMonth(currentDate)

  const currentMonthTransactions = state.transactions.filter((t) => {
    const date = parseISO(t.date)
    return date >= startOfCurrentMonth && date <= endOfCurrentMonth
  })

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("dashboard.title")}</h2>
          <div className="flex items-center gap-2">
            <ExportPDF />
            <Button asChild variant="outline" className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20">
              <Link href="/ai-insights">
                <BrainCircuitIcon className="mr-2 h-4 w-4" />
                {translate("nav.ai_insights")}
              </Link>
            </Button>
            <Button asChild className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
              <Link href="/add-transaction">
                <DollarSignIcon className="mr-2 h-4 w-4" />
                {translate("transactions.add")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-blue-500 dark:bg-blue-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-blue-500 dark:bg-blue-600 bg-opacity-20 dark:bg-opacity-30">
                  <DollarSignIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("dashboard.total_balance")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalBalance())}</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.across_accounts")}</p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{format(currentDate, "MMMM yyyy")}</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-emerald-500 dark:bg-emerald-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-emerald-500 dark:bg-emerald-600 bg-opacity-20 dark:bg-opacity-30">
                  <ArrowUpIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("dashboard.income")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                {formatCurrency(getTotalIncome())}
              </div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.total_income")}</p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center text-emerald-500 dark:text-emerald-400">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  <span>
                    {translate("dashboard.this_month")}: {formatCurrency(currentMonthIncome)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-rose-500 dark:bg-rose-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-rose-500 dark:bg-rose-600 bg-opacity-20 dark:bg-opacity-30">
                  <ArrowDownIcon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("dashboard.expenses")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500 dark:text-rose-400">
                {formatCurrency(getTotalExpenses())}
              </div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.total_expenses")}</p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center text-rose-500 dark:text-rose-400">
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                  <span>
                    {translate("dashboard.this_month")}: {formatCurrency(currentMonthExpenses)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-purple-500 dark:bg-purple-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-purple-500 dark:bg-purple-600 bg-opacity-20 dark:bg-opacity-30">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("dashboard.savings_rate")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getSavingsRate()}%</div>
              <p className="text-xs text-muted-foreground">{translate("dashboard.of_income")}</p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{translate("dashboard.monthly_average")}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="card col-span-4 dark:border-border/20 elevated-surface">
            <CardHeader className="flex flex-row items-center justify-between card-header-highlight">
              <div>
                <CardTitle>{translate("dashboard.monthly_overview")}</CardTitle>
                <CardDescription>{translate("dashboard.income_vs_expenses")}</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
              >
                <BarChart4 className="h-3.5 w-3.5" />
                {translate("dashboard.detailed_view")}
              </Button>
            </CardHeader>
            <CardContent className="pl-2">
              <FinanceChart />
            </CardContent>
            <CardFooter className="border-t px-6 py-3 dark:border-border/20 divider">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div>
                  {translate("dashboard.current_month_balance")}:
                  <span
                    className={
                      currentMonthBalance >= 0
                        ? "text-emerald-500 dark:text-emerald-400 ml-1"
                        : "text-rose-500 dark:text-rose-400 ml-1"
                    }
                  >
                    {formatCurrency(currentMonthBalance)}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 dark:hover:bg-muted/20">
                  <Download className="h-3.5 w-3.5" />
                  {translate("dashboard.export_data")}
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card className="card col-span-3 dark:border-border/20 elevated-surface">
            <CardHeader className="card-header-highlight">
              <CardTitle>{translate("dashboard.recent_transactions")}</CardTitle>
              <CardDescription>{translate("dashboard.latest_activities")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div className="flex items-center" key={transaction.id}>
                      <div className="mr-4 rounded-full bg-primary/10 p-2 dark:bg-primary/20">
                        {transaction.category === "housing" ? (
                          <HomeIcon className="h-4 w-4 text-primary dark:text-primary-foreground" />
                        ) : transaction.type === "income" ? (
                          <DollarSignIcon className="h-4 w-4 text-primary dark:text-primary-foreground" />
                        ) : (
                          <CreditCardIcon className="h-4 w-4 text-primary dark:text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                      </div>
                      <div
                        className={`font-medium ${
                          transaction.type === "income"
                            ? "text-emerald-500 dark:text-emerald-400"
                            : "text-rose-500 dark:text-rose-400"
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
                  <Button
                    variant="outline"
                    className="w-full dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
                    asChild
                  >
                    <Link href="/transactions">{translate("dashboard.view_all")}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-3 dark:border-border/20 divider">
              <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                <div>
                  {translate("dashboard.total_transactions")}: {state.transactions.length}
                </div>
                <Link href="/add-transaction" className="text-primary hover:underline">
                  {translate("dashboard.add_new")}
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

