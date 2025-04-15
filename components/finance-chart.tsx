"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns"

export default function FinanceChart() {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const currentDate = new Date()
    const data = []

    // Generar datos para los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentDate, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthName = format(monthDate, "MMM")

      // Filtrar transacciones para este mes
      const monthTransactions = state.transactions.filter((t) => {
        const transactionDate = parseISO(t.date)
        return transactionDate >= monthStart && transactionDate <= monthEnd
      })

      // Calcular ingresos y gastos
      const income = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

      const expenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      data.push({
        name: monthName,
        income,
        expenses,
        balance: income - expenses,
      })
    }

    setChartData(data)
  }, [state.transactions])

  const formatYAxis = (value: number) => {
    return formatCurrency(value, { notation: "compact" })
  }

  // Traducciones para las leyendas
  const getTranslation = (key: string): string => {
    const translations: Record<string, string> = {
      income: translate("dashboard.income") || "Ingresos",
      expenses: translate("dashboard.expenses") || "Gastos",
      balance: translate("dashboard.balance") || "Balance",
    }
    return translations[key] || key
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex justify-between items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span>{getTranslation(entry.dataKey)}</span>
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
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#a1a1aa" : "#71717a", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            tickFormatter={formatYAxis}
            axisLine={false}
            tickLine={false}
            tick={{ fill: isDark ? "#a1a1aa" : "#71717a", fontSize: 12 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={36} formatter={(value) => getTranslation(value)} />
          <Line
            type="monotone"
            dataKey="income"
            name={getTranslation("income")}
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name={getTranslation("expenses")}
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            name={getTranslation("balance")}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
