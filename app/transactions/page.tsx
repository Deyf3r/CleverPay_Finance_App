"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, FileText, Search, Calendar, Download } from "lucide-react"
import { format } from "date-fns"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import TransactionList from "@/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExportPDF } from "@/components/export-pdf"
import type { TransactionType } from "@/types/finance"

export default function TransactionsPage() {
  const { getTotalIncome, getTotalExpenses, state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined)
  const [selectedType, setSelectedType] = useState<TransactionType | undefined>(undefined)

  // Get current month and year
  const currentMonth = format(new Date(), "MMMM yyyy")

  // Get unique months from transactions
  const months = Array.from(new Set(state.transactions.map((t) => format(new Date(t.date), "MMMM yyyy")))).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  )

  // Calculate total transactions
  const totalTransactions = state.transactions.length

  // Calcular estadísticas adicionales
  const averageTransaction = totalTransactions > 0 ? (getTotalIncome() + getTotalExpenses()) / totalTransactions : 0

  const largestExpense = state.transactions
    .filter((t) => t.type === "expense")
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0)

  const largestIncome = state.transactions
    .filter((t) => t.type === "income")
    .reduce((max, t) => (t.amount > max ? t.amount : max), 0)

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("transactions.title")}</h2>
          <div className="flex items-center gap-2">
            <ExportPDF />
            <Button asChild className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
              <Link href="/add-transaction">
                <PlusIcon className="mr-2 h-4 w-4" />
                {translate("transactions.add")}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Tarjetas con el mismo estilo que la página de cuentas */}
          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-blue-500 dark:bg-blue-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-blue-500 dark:bg-blue-600 bg-opacity-20 dark:bg-opacity-30">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("transactions.all")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalIncome() + getTotalExpenses())}</div>
              <p className="text-xs text-muted-foreground">
                {totalTransactions} {translate("transactions.total")}
              </p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{currentMonth}</span>
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
                <CardTitle className="text-sm font-medium">{translate("transactions.income")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                {formatCurrency(getTotalIncome())}
              </div>
              <p className="text-xs text-muted-foreground">
                {state.transactions.filter((t) => t.type === "income").length} {translate("transactions.total")}
              </p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center text-emerald-500 dark:text-emerald-400">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  <span>
                    {translate("transactions.largest")}: {formatCurrency(largestIncome)}
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
                <CardTitle className="text-sm font-medium">{translate("transactions.expenses")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-500 dark:text-rose-400">
                {formatCurrency(getTotalExpenses())}
              </div>
              <p className="text-xs text-muted-foreground">
                {state.transactions.filter((t) => t.type === "expense").length} {translate("transactions.total")}
              </p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center text-rose-500 dark:text-rose-400">
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                  <span>
                    {translate("transactions.largest")}: {formatCurrency(largestExpense)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card className="card overflow-hidden dark:border-border/20 elevated-surface">
            <div className="h-2 w-full bg-amber-500 dark:bg-amber-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-highlight">
              <div className="flex items-center space-x-2">
                <div className="rounded-full p-1 bg-amber-500 dark:bg-amber-600 bg-opacity-20 dark:bg-opacity-30">
                  <Download className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-medium">{translate("transactions.average")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageTransaction)}</div>
              <p className="text-xs text-muted-foreground">{translate("transactions.per_transaction")}</p>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <div className="flex w-full justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span>{translate("transactions.this_period")}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder={translate("transactions.search")}
                className="pl-8 input-material"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedType || "all"}
                onValueChange={(value) => setSelectedType(value === "all" ? undefined : (value as TransactionType))}
              >
                <SelectTrigger className="w-[180px] input-material">
                  <SelectValue placeholder={translate("transactions.type")} />
                </SelectTrigger>
                <SelectContent className="dark:bg-card dark:border-border/20">
                  <SelectItem value="all">{translate("transactions.all_transactions")}</SelectItem>
                  <SelectItem value="income">{translate("transactions.income")}</SelectItem>
                  <SelectItem value="expense">{translate("transactions.expenses")}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedMonth || "all"}
                onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : value)}
              >
                <SelectTrigger className="w-[180px] input-material">
                  <SelectValue placeholder={translate("transactions.month")} />
                </SelectTrigger>
                <SelectContent className="dark:bg-card dark:border-border/20">
                  <SelectItem value="all">{translate("transactions.all_months")}</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="card dark:border-border/20 elevated-surface">
            <CardHeader className="card-header-highlight">
              <CardTitle>{translate("transactions.transaction_list")}</CardTitle>
              <CardDescription>{translate("transactions.filter_description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-6 pt-2">
                  <TabsList className="grid w-full grid-cols-3 dark:bg-muted/10">
                    <TabsTrigger
                      value="all"
                      onClick={() => setSelectedType(undefined)}
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      {translate("transactions.all_transactions")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="income"
                      onClick={() => setSelectedType("income")}
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      {translate("transactions.income")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="expenses"
                      onClick={() => setSelectedType("expense")}
                      className="dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary-foreground"
                    >
                      {translate("transactions.expenses")}
                    </TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="all" className="mt-0">
                  <TransactionList type={selectedType} month={selectedMonth} />
                </TabsContent>
                <TabsContent value="income" className="mt-0">
                  <TransactionList type="income" month={selectedMonth} />
                </TabsContent>
                <TabsContent value="expenses" className="mt-0">
                  <TransactionList type="expense" month={selectedMonth} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4 dark:border-border/20 divider">
              <div className="text-xs text-muted-foreground">
                {translate("transactions.showing")} {totalTransactions} {translate("transactions.entries")}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
              >
                <Download className="h-3.5 w-3.5" />
                {translate("transactions.export_csv")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
