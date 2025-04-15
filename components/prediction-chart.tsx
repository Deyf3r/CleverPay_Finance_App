"use client"

import { useTheme } from "next-themes"
import { BarChart3Icon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { useSettings } from "@/context/settings-context"
import { Card, CardContent } from "./ui/card"

interface PredictionData {
  month: string
  amount: number
}

interface PredictionChartProps {
  incomeData: PredictionData[]
  expenseData: PredictionData[]
  title: string
}

export default function PredictionChart({ incomeData, expenseData, title }: PredictionChartProps) {
  const { theme } = useTheme()
  const { formatCurrency, translate } = useSettings()
  const isDark = theme === "dark"

  // Combinar datos para el gráfico
  const chartData = Array.from(new Set([...incomeData.map((d) => d.month), ...expenseData.map((d) => d.month)]))
    .map((month) => {
      const income = incomeData.find((d) => d.month === month)?.amount || 0
      const expense = expenseData.find((d) => d.month === month)?.amount || 0
      return { month, income, expense }
    })
    .sort((a, b) => {
      const dateA = new Date(a.month)
      const dateB = new Date(b.month)
      return dateA.getTime() - dateB.getTime()
    })

  // Colores basados en el tema
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

  if (incomeData.length === 0 && expenseData.length === 0) {
    return (
      <div className="h-[300px] w-full bg-muted/20 flex flex-col items-center justify-center rounded-md">
        <BarChart3Icon className="h-16 w-16 text-muted mb-2" />
        <span className="text-muted-foreground">{translate("ai.no_prediction_data")}</span>
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            name={translate("ai.predicted_income")}
            dataKey="income"
            fill={incomeColor}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Bar
            name={translate("ai.predicted_expenses")}
            dataKey="expense"
            fill={expenseColor}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
