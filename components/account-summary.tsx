"use client"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface AccountSummaryProps {
  accountType: string
}

export function AccountSummary({ accountType }: AccountSummaryProps) {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const { transactions } = state

  // Obtener transacciones de la cuenta
  const accountTransactions = transactions.filter((t) => t.account === accountType)

  // Obtener fecha actual y mes anterior
  const currentDate = new Date()
  const currentMonth = startOfMonth(currentDate)
  const lastMonth = startOfMonth(subMonths(currentDate, 1))

  // Filtrar transacciones por mes
  const currentMonthTransactions = accountTransactions.filter((t) => {
    const date = parseISO(t.date)
    return date >= currentMonth && date <= endOfMonth(currentDate)
  })

  const lastMonthTransactions = accountTransactions.filter((t) => {
    const date = parseISO(t.date)
    return date >= lastMonth && date < currentMonth
  })

  // Calcular ingresos y gastos por mes
  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthIncome = lastMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpenses = lastMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  // Calcular cambios porcentuales
  const incomeChange = lastMonthIncome > 0 ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0

  const expensesChange =
    lastMonthExpenses > 0 ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0

  // Preparar datos para el gráfico de categorías
  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, transaction) => {
        const category = transaction.category
        if (!acc[category]) acc[category] = 0
        acc[category] += transaction.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      name: translate(`category.${category}`),
      value: amount,
      category,
    }))
    .sort((a, b) => b.value - a.value)

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Comparison</CardTitle>
            <CardDescription>
              {format(currentMonth, "MMMM yyyy")} vs {format(lastMonth, "MMMM yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Income</span>
                <div className="flex items-center">
                  <span className="font-medium text-emerald-500 dark:text-emerald-400">
                    {formatCurrency(currentMonthIncome)}
                  </span>
                  {incomeChange !== 0 && (
                    <span
                      className={`ml-2 text-xs ${incomeChange > 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                    >
                      {incomeChange > 0 ? "↑" : "↓"} {Math.abs(incomeChange).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <Progress
                value={lastMonthIncome > 0 ? Math.min(100, (currentMonthIncome / lastMonthIncome) * 100) : 0}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Expenses</span>
                <div className="flex items-center">
                  <span className="font-medium text-rose-500 dark:text-rose-400">
                    {formatCurrency(currentMonthExpenses)}
                  </span>
                  {expensesChange !== 0 && (
                    <span
                      className={`ml-2 text-xs ${expensesChange < 0 ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                    >
                      {expensesChange > 0 ? "↑" : "↓"} {Math.abs(expensesChange).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <Progress
                value={lastMonthExpenses > 0 ? Math.min(100, (currentMonthExpenses / lastMonthExpenses) * 100) : 0}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Net Flow</span>
                <span
                  className={`font-medium ${
                    currentMonthIncome - currentMonthExpenses > 0
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  }`}
                >
                  {formatCurrency(currentMonthIncome - currentMonthExpenses)}
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.max(0, (currentMonthIncome / Math.max(currentMonthExpenses, 1)) * 100))}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expense Categories</CardTitle>
            <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), translate("accounts.amount")]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                No expenses this month
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="card">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Top Expenses</CardTitle>
          <CardDescription>{format(currentMonth, "MMMM yyyy")}</CardDescription>
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
                      width: `${(category.value / currentMonthExpenses) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {((category.value / currentMonthExpenses) * 100).toFixed(1)}%
                </div>
              </div>
            ))}

            {categoryData.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No expenses this month</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

