"use client"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO, subMonths } from "date-fns"
import { BarChart3Icon } from "lucide-react"
import { useTheme } from "next-themes"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
  ComposedChart,
  Line,
} from "recharts"
import { Card, CardContent } from "./ui/card"

interface AccountChartProps {
  accountType: string
}

export function AccountChart({ accountType }: AccountChartProps) {
  const { state } = useFinance()
  const { translate, formatCurrency } = useSettings()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Filtrar transacciones para la cuenta seleccionada
  const accountTransactions = state.transactions.filter((t) => t.account === accountType)

  // Preparar datos para el gráfico
  const currentDate = new Date()
  const sixMonthsAgo = subMonths(currentDate, 6)

  // Crear un array de los últimos 6 meses
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(currentDate, i)
    months.push(format(monthDate, "MMM yyyy"))
  }

  // Inicializar datos mensuales
  const monthlyData: Record<string, { income: number; expenses: number; balance: number }> = {}

  months.forEach((month) => {
    monthlyData[month] = { income: 0, expenses: 0, balance: 0 }
  })

  // Calcular saldo inicial (saldo actual menos todas las transacciones en los últimos 6 meses)
  let initialBalance = state.accounts[accountType as keyof typeof state.accounts]?.balance || 0

  accountTransactions.forEach((transaction) => {
    const date = parseISO(transaction.date)
    if (date >= sixMonthsAgo) {
      initialBalance -= transaction.type === "income" ? transaction.amount : -transaction.amount
    }
  })

  // Calcular datos mensuales
  let runningBalance = initialBalance

  accountTransactions
    .filter((t) => parseISO(t.date) >= sixMonthsAgo)
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const month = format(date, "MMM yyyy")

      if (monthlyData[month]) {
        if (transaction.type === "income") {
          monthlyData[month].income += transaction.amount
          runningBalance += transaction.amount
        } else {
          monthlyData[month].expenses += transaction.amount
          runningBalance -= transaction.amount
        }
        monthlyData[month].balance = runningBalance
      }
    })

  // Preparar datos para el gráfico
  const chartData = months.map((month) => ({
    month,
    income: monthlyData[month].income,
    expenses: monthlyData[month].expenses,
    balance: monthlyData[month].balance,
  }))

  // Colores basados en el tema
  const balanceColor = "#7c3aed" // Púrpura para el saldo
  const incomeColor = "#10b981" // Verde para ingresos
  const expenseColor = isDark ? "#f87171" : "#ef4444" // Rojo para gastos
  const gridColor = isDark ? "#334155" : "#e2e8f0"
  const textColor = isDark ? "#e2e8f0" : "#1e293b"

  // Personalizar el tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <Card className="p-2 border shadow-md dark:bg-card/95 backdrop-blur-sm">
          <CardContent className="p-2">
            <p className="font-medium text-sm mb-1">{label}</p>
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="font-medium">{entry.name}:</span>
                <span>{formatCurrency(entry.value as number)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    }
    return null
  }

  if (accountTransactions.length === 0) {
    return (
      <div className="h-[300px] w-full bg-muted/20 flex flex-col items-center justify-center rounded-md">
        <BarChart3Icon className="h-16 w-16 text-muted mb-2" />
        <span className="text-muted-foreground">{translate("accounts.no_data")}</span>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
          <Bar
            name={translate("accounts.income")}
            dataKey="income"
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Bar
            name={translate("accounts.expenses")}
            dataKey="expenses"
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Line
            name={translate("accounts.balance")}
            type="monotone"
            dataKey="balance"
            stroke={balanceColor}
            strokeWidth={3}
            dot={{ r: 4, fill: balanceColor, strokeWidth: 1, stroke: isDark ? "#1e1e2f" : "#ffffff" }}
            activeDot={{ r: 6, fill: balanceColor, strokeWidth: 1, stroke: isDark ? "#1e1e2f" : "#ffffff" }}
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

