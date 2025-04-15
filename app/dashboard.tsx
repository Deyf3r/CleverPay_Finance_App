"use client"

import Link from "next/link"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSignIcon,
  BrainCircuitIcon,
  BarChart4Icon,
  PiggyBankIcon,
  CalendarIcon,
  DownloadIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import FinanceChart from "@/components/finance-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns"
import { ExportPDF } from "@/components/export-pdf"
import { useState } from "react"
import { DetailedFinanceView } from "@/components/detailed-finance-view"
import TransactionList from "@/components/transaction-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { state, getTotalBalance, getTotalIncome, getTotalExpenses, getSavingsRate } = useFinance()
  const { formatCurrency, translate } = useSettings()

  // Calcular estadísticas del mes actual
  const currentDate = new Date()
  const startOfCurrentMonth = startOfMonth(currentDate)
  const endOfCurrentMonth = endOfMonth(currentDate)

  const currentMonthTransactions = state.transactions.filter((t) => {
    const date = parseISO(t.date)
    return date >= startOfCurrentMonth && date <= endOfMonth(currentDate)
  })

  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses

  // Añadir el estado para controlar la vista detallada
  const [showDetailedView, setShowDetailedView] = useState(false)

  // Obtener las cuentas para mostrar en el dashboard
  const accountsArray = Object.entries(state.accounts).map(([type, account]) => ({
    type,
    ...account,
  }))

  // Calcular las categorías de gastos principales
  const topExpenseCategories = () => {
    const categoryTotals: Record<string, number> = {}

    state.transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const category = t.category
        if (!categoryTotals[category]) categoryTotals[category] = 0
        categoryTotals[category] += t.amount
      })

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
  }

  // Calcular las categorías de ingresos principales
  const topIncomeCategories = () => {
    const categoryTotals: Record<string, number> = {}

    state.transactions
      .filter((t) => t.type === "income")
      .forEach((t) => {
        const category = t.category
        if (!categoryTotals[category]) categoryTotals[category] = 0
        categoryTotals[category] += t.amount
      })

    return Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  // Añadir la condición para mostrar la vista detallada o el dashboard normal
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

        {showDetailedView ? (
          <DetailedFinanceView onBack={() => setShowDetailedView(false)} />
        ) : (
          <>
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
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{format(currentDate, "MMMM yyyy")}</span>
                    </div>
                    <Link href="/accounts" className="text-primary hover:underline flex items-center">
                      <span>{translate("nav.accounts")}</span>
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </Link>
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
                    <Link href="/transactions?type=income" className="text-primary hover:underline flex items-center">
                      <span>{translate("transactions.income")}</span>
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </Link>
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
                    <Link href="/transactions?type=expense" className="text-primary hover:underline flex items-center">
                      <span>{translate("transactions.expenses")}</span>
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </CardFooter>
              </Card>

              <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
                <div className="h-2 w-full bg-purple-500 dark:bg-purple-600" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full p-1 bg-purple-500 dark:bg-purple-600 bg-opacity-20 dark:bg-opacity-30">
                      <PiggyBankIcon className="h-5 w-5" />
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
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{translate("dashboard.monthly_average")}</span>
                    </div>
                    <Link href="/ai-insights?tab=savings" className="text-primary hover:underline flex items-center">
                      <span>{translate("ai.savings")}</span>
                      <ExternalLinkIcon className="ml-1 h-3 w-3" />
                    </Link>
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
                    onClick={() => setShowDetailedView(true)}
                  >
                    <BarChart4Icon className="h-3.5 w-3.5" />
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
                      <DownloadIcon className="h-3.5 w-3.5" />
                      {translate("dashboard.export_data")}
                    </Button>
                  </div>
                </CardFooter>
              </Card>

              <Card className="card col-span-3 dark:border-border/20 elevated-surface">
                <CardHeader className="card-header-highlight">
                  <div className="flex items-center justify-between">
                    <CardTitle>{translate("dashboard.recent_transactions")}</CardTitle>
                    <Link href="/add-transaction" className="text-primary hover:underline text-sm">
                      {translate("transactions.add")}
                    </Link>
                  </div>
                  <CardDescription>{translate("dashboard.latest_activities")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList limit={5} showViewAll={true} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="card dark:border-border/20 elevated-surface h-full">
                <CardHeader className="card-header-highlight">
                  <div className="flex items-center justify-between">
                    <CardTitle>{translate("nav.accounts")}</CardTitle>
                    <Link href="/accounts" className="text-primary hover:underline text-sm">
                      {translate("dashboard.view_all")}
                    </Link>
                  </div>
                  <CardDescription>{translate("dashboard.across_accounts")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {accountsArray.map((account) => (
                      <div key={account.type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              account.type === "checking"
                                ? "bg-blue-500"
                                : account.type === "savings"
                                  ? "bg-green-500"
                                  : account.type === "credit"
                                    ? "bg-purple-500"
                                    : "bg-amber-500"
                            }`}
                          />
                          <span className="text-sm">{translate(`account.${account.type}`)}</span>
                        </div>
                        <Badge variant="outline" className="font-medium">
                          {formatCurrency(account.balance)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-3 dark:border-border/20 divider mt-auto">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/accounts">
                      {translate("nav.accounts")}
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="card dark:border-border/20 elevated-surface h-full">
                <CardHeader className="card-header-highlight">
                  <div className="flex items-center justify-between">
                    <CardTitle>{translate("dashboard.spending_trends")}</CardTitle>
                    <Link href="/ai-insights" className="text-primary hover:underline text-sm">
                      {translate("ai.insights")}
                    </Link>
                  </div>
                  <CardDescription>{translate("dashboard.monthly_spending_evolution")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4">
                    {topExpenseCategories().map(([category, amount], index) => (
                      <div key={category} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{translate(`category.${category}`)}</span>
                          <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              index === 0
                                ? "bg-rose-500"
                                : index === 1
                                  ? "bg-orange-500"
                                  : index === 2
                                    ? "bg-amber-500"
                                    : "bg-yellow-500"
                            }`}
                            style={{ width: `${Math.min(100, (amount / getTotalExpenses()) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-3 dark:border-border/20 divider mt-auto">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/ai-insights">
                      {translate("ai.title")}
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="card dark:border-border/20 elevated-surface h-full">
                <CardHeader className="card-header-highlight">
                  <CardTitle>{translate("dashboard.expense_ratio")}</CardTitle>
                  <CardDescription>{translate("dashboard.distribution_by_category")}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <Tabs defaultValue="income" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="income" className="flex items-center gap-1">
                        <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-500" />
                        {translate("transactions.income")}
                      </TabsTrigger>
                      <TabsTrigger value="expense" className="flex items-center gap-1">
                        <TrendingDownIcon className="h-3.5 w-3.5 text-rose-500" />
                        {translate("transactions.expenses")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="income">
                      <div className="space-y-4">
                        {topIncomeCategories().map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="font-normal bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                              >
                                {translate(`category.${category}`)}
                              </Badge>
                            </div>
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="expense">
                      <div className="space-y-4">
                        {topExpenseCategories()
                          .slice(0, 3)
                          .map(([category, amount]) => (
                            <div key={category} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-normal bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                                >
                                  {translate(`category.${category}`)}
                                </Badge>
                              </div>
                              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                {formatCurrency(amount)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t px-6 py-3 dark:border-border/20 divider mt-auto">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/transactions">
                      {translate("transactions.title")}
                      <ExternalLinkIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
