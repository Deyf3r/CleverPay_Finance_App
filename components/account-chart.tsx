"use client"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns"
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
  const sixMonthsAgo = startOfMonth(subMonths(currentDate, 5))

  // Crear un array de los últimos 6 meses
  const monthsData: { date: Date; key: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(currentDate, i)
    monthsData.push({
      date: startOfMonth(monthDate),
      key: format(monthDate, "MMM yyyy"),
    })
  }

  // Obtener el saldo actual de la cuenta
  const currentBalance = state.accounts[accountType as keyof typeof state.accounts]?.balance || 0

  // Calcular el saldo inicial (antes del período de 6 meses)
  let initialBalance = currentBalance

  // Restar el efecto de todas las transacciones en los últimos 6 meses
  accountTransactions.forEach((transaction) => {
    const transactionDate = parseISO(transaction.date)
    if (transactionDate >= sixMonthsAgo) {
      if (transaction.type === "income") {
        initialBalance -= transaction.amount
      } else {
        initialBalance += transaction.amount
      }
    }
  })

  // Inicializar datos mensuales con el saldo inicial
  const monthlyData = monthsData.reduce<
    Record<
      string,
      {
        income: number
        expenses: number
        balance: number
        transactions: number
      }
    >
  >((acc, { key }) => {
    acc[key] = { income: 0, expenses: 0, balance: 0, transactions: 0 }
    return acc
  }, {})

  // Procesar transacciones mes a mes
  let runningBalance = initialBalance

  // Procesar cada mes secuencialmente
  monthsData.forEach((month, index) => {
    const monthKey = month.key
    const monthStart = month.date
    const monthEnd = index < monthsData.length - 1 ? monthsData[index + 1].date : endOfMonth(currentDate)

    // Filtrar transacciones para este mes
    const monthTransactions = accountTransactions.filter((t) => {
      const date = parseISO(t.date)
      return date >= monthStart && date < monthEnd
    })

    // Calcular ingresos y gastos del mes
    let monthIncome = 0
    let monthExpenses = 0

    monthTransactions.forEach((transaction) => {
      if (transaction.type === "income") {
        monthIncome += transaction.amount
        runningBalance += transaction.amount
      } else {
        monthExpenses += transaction.amount
        runningBalance -= transaction.amount
      }
    })

    // Guardar datos del mes
    monthlyData[monthKey] = {
      income: monthIncome,
      expenses: monthExpenses,
      balance: runningBalance,
      transactions: monthTransactions.length,
    }
  })

  // Preparar datos para el gráfico
  const chartData = monthsData.map(({ key }) => ({
    month: key,
    income: monthlyData[key].income,
    expenses: monthlyData[key].expenses,
    balance: monthlyData[key].balance,
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
        <span className="text-muted-foreground">No transaction data available</span>
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
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => (
              <span className="text-sm font-medium">{translate(`accounts.${value.toLowerCase()}`)}</span>
            )}
          />
          <Bar
            name="Income"
            dataKey="income"
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Bar
            name="Expenses"
            dataKey="expenses"
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            barSize={20}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Line
            name="Balance"
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
