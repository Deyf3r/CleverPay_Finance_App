"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO, subMonths } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
} from "recharts"
import type { AccountType } from "@/types/finance"

export function DetailedAccountView({ accountType, onBack }: { accountType: AccountType; onBack: () => void }) {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [timeRange, setTimeRange] = useState("6m")
  const [chartType, setChartType] = useState("line")

  // Obtener datos según el rango de tiempo seleccionado
  const getTimeRangeData = () => {
    const currentDate = new Date()
    let monthsToShow = 6

    switch (timeRange) {
      case "3m":
        monthsToShow = 3
        break
      case "6m":
        monthsToShow = 6
        break
      case "1y":
        monthsToShow = 12
        break
      case "all":
        monthsToShow = 24 // Mostrar hasta 2 años si hay datos
        break
    }

    // Filtrar transacciones para esta cuenta
    const accountTransactions = state.transactions.filter((t) => t.account === accountType)

    // Generar datos mensuales
    const monthlyData: Record<string, { income: number; expenses: number; balance: number }> = {}

    // Inicializar los últimos X meses
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i)
      const monthKey = format(monthDate, "MMM yyyy")
      monthlyData[monthKey] = { income: 0, expenses: 0, balance: 0 }
    }

    // Calcular saldo inicial (saldo actual menos todas las transacciones en el período)
    let initialBalance = state.accounts[accountType].balance

    accountTransactions.forEach((transaction) => {
      const date = parseISO(transaction.date)
      if (date >= subMonths(currentDate, monthsToShow)) {
        initialBalance -= transaction.type === "income" ? transaction.amount : -transaction.amount
      }
    })

    // Calcular datos mensuales
    let runningBalance = initialBalance

    accountTransactions
      .filter((t) => parseISO(t.date) >= subMonths(currentDate, monthsToShow))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .forEach((transaction) => {
        const date = parseISO(transaction.date)
        const monthKey = format(date, "MMM yyyy")

        if (monthlyData[monthKey]) {
          if (transaction.type === "income") {
            monthlyData[monthKey].income += transaction.amount
            runningBalance += transaction.amount
          } else {
            monthlyData[monthKey].expenses += transaction.amount
            runningBalance -= transaction.amount
          }
          monthlyData[monthKey].balance = runningBalance
        }
      })

    // Convertir a array para el gráfico
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.balance,
    }))
  }

  const chartData = getTimeRangeData()

  // Calcular totales para el período seleccionado
  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0)
  const netBalance = totalIncome - totalExpenses
  const currentBalance = state.accounts[accountType].balance

  // Calcular datos para el gráfico de categorías
  const getCategoryData = () => {
    const categories: Record<string, number> = {}

    // Filtrar transacciones según el rango de tiempo
    const currentDate = new Date()
    const startDate = subMonths(currentDate, timeRange === "all" ? 24 : Number.parseInt(timeRange.replace(/\D/g, "")))

    state.transactions
      .filter((t) => t.type === "expense" && t.account === accountType && parseISO(t.date) >= startDate)
      .forEach((transaction) => {
        if (!categories[transaction.category]) {
          categories[transaction.category] = 0
        }
        categories[transaction.category] += transaction.amount
      })

    return Object.entries(categories)
      .map(([category, amount]) => ({
        name: translate(`category.${category}`) || category,
        value: amount,
        category,
      }))
      .sort((a, b) => b.value - a.value)
  }

  const categoryData = getCategoryData()

  // Colores para el gráfico de categorías
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FF6B6B",
    "#6A7FDB",
    "#F7C59F",
    "#9B5DE5",
  ]

  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{entry.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {translate("accounts.back")}
        </Button>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 año</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Líneas</SelectItem>
              <SelectItem value="bar">Barras</SelectItem>
              <SelectItem value="area">Área</SelectItem>
              <SelectItem value="composed">Compuesto</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/20"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dark:border-border/20 elevated-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translate("accounts.current_balance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            <p className="text-xs text-muted-foreground">{translate("accounts.as_of_today")}</p>
          </CardContent>
        </Card>

        <Card className="dark:border-border/20 elevated-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translate("accounts.total_income")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">{translate("accounts.selected_period")}</p>
          </CardContent>
        </Card>

        <Card className="dark:border-border/20 elevated-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translate("accounts.total_expenses")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500 dark:text-rose-400">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{translate("accounts.selected_period")}</p>
          </CardContent>
        </Card>

        <Card className="dark:border-border/20 elevated-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{translate("accounts.net_flow")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
            >
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">{translate("accounts.selected_period")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{translate("accounts.overview")}</TabsTrigger>
          <TabsTrigger value="categories">{translate("accounts.categories")}</TabsTrigger>
          <TabsTrigger value="transactions">{translate("accounts.transactions")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="dark:border-border/20 elevated-surface">
            <CardHeader>
              <CardTitle>{translate("accounts.account_activity")}</CardTitle>
              <CardDescription>{translate("accounts.activity_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" && (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value, { notation: "compact" })} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="income"
                        name={translate("accounts.income")}
                        stroke="#10b981"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="expenses"
                        name={translate("accounts.expenses")}
                        stroke="#f43f5e"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        name={translate("accounts.balance")}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  )}

                  {chartType === "bar" && (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value, { notation: "compact" })} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" name={translate("accounts.income")} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="expenses"
                        name={translate("accounts.expenses")}
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}

                  {chartType === "area" && (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value, { notation: "compact" })} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="income"
                        name={translate("accounts.income")}
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        name={translate("accounts.expenses")}
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        name={translate("accounts.balance")}
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    </LineChart>
                  )}

                  {chartType === "composed" && (
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value, { notation: "compact" })} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="income" name={translate("accounts.income")} fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar
                        dataKey="expenses"
                        name={translate("accounts.expenses")}
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        name={translate("accounts.balance")}
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle>{translate("accounts.expense_categories")}</CardTitle>
                <CardDescription>{translate("accounts.distribution_by_category")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:border-border/20 elevated-surface">
              <CardHeader>
                <CardTitle>{translate("accounts.top_expenses")}</CardTitle>
                <CardDescription>{translate("accounts.highest_spending_categories")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.slice(0, 5).map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(category.value / (categoryData[0]?.value || 1)) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {((category.value / totalExpenses) * 100).toFixed(1)}% del total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="dark:border-border/20 elevated-surface">
            <CardHeader>
              <CardTitle>{translate("accounts.recent_transactions")}</CardTitle>
              <CardDescription>{translate("accounts.recent_transactions_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.transactions
                  .filter((t) => t.account === accountType)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border dark:border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-full p-2 ${transaction.type === "income" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}
                        >
                          {transaction.type === "income" ? (
                            <svg
                              className="h-4 w-4 text-emerald-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg
                              className="h-4 w-4 text-rose-500"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(transaction.date), "MMM d, yyyy")} •{" "}
                            {translate(`category.${transaction.category}`)}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`font-medium ${transaction.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
