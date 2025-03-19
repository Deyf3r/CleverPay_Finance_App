"use client"

import { useEffect, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO, subMonths } from "date-fns"
import { BarChart3Icon } from "lucide-react"
import { useTheme } from "next-themes"

interface AccountChartProps {
  accountType: string
}

export function AccountChart({ accountType }: AccountChartProps) {
  const { state } = useFinance()
  const { translate } = useSettings()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Filtrar transacciones para la cuenta seleccionada
    const accountTransactions = state.transactions.filter((t) => t.account === accountType)
    if (accountTransactions.length === 0) return

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
    let initialBalance = state.accounts[accountType as keyof typeof state.accounts].balance

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
    const balances = months.map((month) => monthlyData[month].balance)
    const incomes = months.map((month) => monthlyData[month].income)
    const expenses = months.map((month) => monthlyData[month].expenses)

    // Limpiar canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Configurar dimensiones
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Encontrar valores máximos para escalar
    const maxBalance = Math.max(...balances, 0)
    const maxTransaction = Math.max(...incomes, ...expenses)
    const maxValue = Math.max(maxBalance, maxTransaction) * 1.1 // Añadir 10% de margen

    // Colores basados en el tema
    const axisColor = isDark ? "#64748b" : "#94a3b8"
    const textColor = isDark ? "#e2e8f0" : "#1e293b"
    const gridColor = isDark ? "#334155" : "#e2e8f0"
    const balanceColor = "#7c3aed" // Púrpura para el saldo
    const incomeColor = "#10b981" // Verde para ingresos
    const expenseColor = isDark ? "#f87171" : "#ef4444" // Rojo para gastos

    // Dibujar ejes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = axisColor
    ctx.stroke()

    // Dibujar línea de saldo
    ctx.beginPath()
    ctx.moveTo(padding, height - padding - (balances[0] / maxValue) * chartHeight)

    balances.forEach((balance, i) => {
      const x = padding + (i * chartWidth) / (months.length - 1)
      const y = height - padding - (balance / maxValue) * chartHeight
      ctx.lineTo(x, y)
    })

    ctx.strokeStyle = balanceColor
    ctx.lineWidth = 2
    ctx.stroke()

    // Dibujar puntos en la línea de saldo
    balances.forEach((balance, i) => {
      const x = padding + (i * chartWidth) / (months.length - 1)
      const y = height - padding - (balance / maxValue) * chartHeight

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = balanceColor
      ctx.fill()
    })

    // Dibujar barras de ingresos y gastos
    const barWidth = chartWidth / (months.length * 3)

    months.forEach((month, i) => {
      const x = padding + (i * chartWidth) / months.length + barWidth

      // Barra de ingresos
      const incomeHeight = (incomes[i] / maxValue) * chartHeight
      ctx.fillStyle = incomeColor
      ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight)

      // Barra de gastos
      const expenseHeight = (expenses[i] / maxValue) * chartHeight
      ctx.fillStyle = expenseColor
      ctx.fillRect(x + barWidth, height - padding - expenseHeight, barWidth, expenseHeight)
    })

    // Dibujar etiquetas de meses
    ctx.fillStyle = axisColor
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"

    months.forEach((month, i) => {
      const x = padding + (i * chartWidth) / months.length + barWidth * 1.5
      ctx.fillText(month, x, height - padding + 15)
    })

    // Dibujar leyenda
    ctx.fillStyle = balanceColor
    ctx.fillRect(width - padding - 100, padding, 10, 10)
    ctx.fillStyle = incomeColor
    ctx.fillRect(width - padding - 100, padding + 20, 10, 10)
    ctx.fillStyle = expenseColor
    ctx.fillRect(width - padding - 100, padding + 40, 10, 10)

    ctx.fillStyle = axisColor
    ctx.textAlign = "left"
    ctx.fillText(translate("accounts.balance"), width - padding - 85, padding + 8)
    ctx.fillText(translate("accounts.income"), width - padding - 85, padding + 28)
    ctx.fillText(translate("accounts.expenses"), width - padding - 85, padding + 48)

    // Dibujar etiquetas del eje Y
    ctx.textAlign = "right"
    ctx.fillStyle = axisColor

    // Dibujar 5 etiquetas espaciadas uniformemente
    for (let i = 0; i <= 4; i++) {
      const value = (maxValue / 4) * i
      const y = height - padding - (chartHeight / 4) * i

      ctx.fillText(`$${value.toFixed(0)}`, padding - 5, y + 3)

      // Dibujar línea de cuadrícula
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = gridColor
      ctx.stroke()
    }
  }, [state.transactions, accountType, state.accounts, theme, isDark, translate])

  return (
    <div className="h-full w-full relative">
      {state.transactions.filter((t) => t.account === accountType).length === 0 ? (
        <div className="h-[300px] w-full bg-muted/20 flex items-center justify-center rounded-md">
          <BarChart3Icon className="h-16 w-16 text-muted" />
          <span className="ml-2 text-muted-foreground">{translate("accounts.no_data")}</span>
        </div>
      ) : (
        <canvas ref={canvasRef} width={800} height={300} className="w-full h-[300px]" />
      )}
    </div>
  )
}

