"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from "lucide-react"
import { format } from "date-fns"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import TransactionList from "@/components/transaction-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("transactions.title")}</h2>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/add-transaction">
                <PlusIcon className="mr-2 h-4 w-4" />
                {translate("transactions.add")}
              </Link>
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translate("transactions.all")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(getTotalIncome() + getTotalExpenses())}</div>
                <p className="text-xs text-muted-foreground">
                  {totalTransactions} {translate("transactions.total")}
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translate("transactions.income")}</CardTitle>
                <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{formatCurrency(getTotalIncome())}</div>
                <p className="text-xs text-muted-foreground">
                  {state.transactions.filter((t) => t.type === "income").length} {translate("transactions.total")}
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translate("transactions.expenses")}</CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-500">{formatCurrency(getTotalExpenses())}</div>
                <p className="text-xs text-muted-foreground">
                  {state.transactions.filter((t) => t.type === "expense").length} {translate("transactions.total")}
                </p>
              </CardContent>
            </Card>
            <Card className="card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{translate("transactions.average")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    totalTransactions > 0 ? (getTotalIncome() + getTotalExpenses()) / totalTransactions : 0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{translate("transactions.per_transaction")}</p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="text"
                  placeholder={translate("transactions.search")}
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={selectedType || "all"}
                  onValueChange={(value) => setSelectedType(value === "all" ? undefined : (value as TransactionType))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={translate("transactions.type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{translate("transactions.all_transactions")}</SelectItem>
                    <SelectItem value="income">{translate("transactions.income")}</SelectItem>
                    <SelectItem value="expense">{translate("transactions.expenses")}</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedMonth || "all"}
                  onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={translate("transactions.month")} />
                  </SelectTrigger>
                  <SelectContent>
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
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setSelectedType(undefined)}>
                  {translate("transactions.all_transactions")}
                </TabsTrigger>
                <TabsTrigger value="income" onClick={() => setSelectedType("income")}>
                  {translate("transactions.income")}
                </TabsTrigger>
                <TabsTrigger value="expenses" onClick={() => setSelectedType("expense")}>
                  {translate("transactions.expenses")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="border rounded-md mt-4">
                <TransactionList type={selectedType} month={selectedMonth} />
              </TabsContent>
              <TabsContent value="income" className="border rounded-md mt-4">
                <TransactionList type="income" month={selectedMonth} />
              </TabsContent>
              <TabsContent value="expenses" className="border rounded-md mt-4">
                <TransactionList type="expense" month={selectedMonth} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

