"use client"

import { useEffect, useRef } from "react"
import { BarChart3Icon } from "lucide-react"
import { useTheme } from "next-themes"

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    if (incomeData.length === 0 && expenseData.length === 0) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Combine data for scaling
    const allData = [...incomeData, ...expenseData]

    // Find max value for scaling
    const maxValue = Math.max(...allData.map((d) => d.amount)) * 1.1 // Add 10% margin

    // Colors based on theme
    const axisColor = isDark ? "#64748b" : "#94a3b8"
    const textColor = isDark ? "#e2e8f0" : "#1e293b"
    const gridColor = isDark ? "#334155" : "#e2e8f0"
    const incomeColor = "#10b981" // Green works well in both themes
    const expenseColor = isDark ? "#f87171" : "#ef4444" // Lighter red for dark mode

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = axisColor
    ctx.stroke()

    // Draw title
    ctx.fillStyle = textColor
    ctx.font = "14px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(title, width / 2, padding / 2)

    // Get unique months from both datasets
    const months = Array.from(new Set([...incomeData.map((d) => d.month), ...expenseData.map((d) => d.month)]))
    months.sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })

    // Draw bars
    const barWidth = chartWidth / (months.length * 2)
    const gap = barWidth / 2

    months.forEach((month, i) => {
      const x = padding + i * (barWidth * 2 + gap)

      // Income bar
      const incomeItem = incomeData.find((d) => d.month === month)
      if (incomeItem) {
        const incomeHeight = (incomeItem.amount / maxValue) * chartHeight
        ctx.fillStyle = incomeColor
        ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight)
      }

      // Expense bar
      const expenseItem = expenseData.find((d) => d.month === month)
      if (expenseItem) {
        const expenseHeight = (expenseItem.amount / maxValue) * chartHeight
        ctx.fillStyle = expenseColor
        ctx.fillRect(x + barWidth + gap, height - padding - expenseHeight, barWidth, expenseHeight)
      }

      // Draw month label
      ctx.fillStyle = axisColor
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(month, x + barWidth + gap / 2, height - padding + 15)
    })

    // Draw legend
    ctx.fillStyle = incomeColor
    ctx.fillRect(width - padding - 100, padding, 10, 10)
    ctx.fillStyle = expenseColor
    ctx.fillRect(width - padding - 100, padding + 20, 10, 10)

    ctx.fillStyle = axisColor
    ctx.textAlign = "left"
    ctx.fillText("Income", width - padding - 85, padding + 8)
    ctx.fillText("Expenses", width - padding - 85, padding + 28)

    // Draw y-axis labels
    ctx.textAlign = "right"
    ctx.fillStyle = axisColor

    // Draw 4 evenly spaced labels
    for (let i = 0; i <= 4; i++) {
      const value = (maxValue / 4) * i
      const y = height - padding - (chartHeight / 4) * i

      ctx.fillText(`$${value.toFixed(0)}`, padding - 5, y + 3)

      // Draw light grid line
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.strokeStyle = gridColor
      ctx.stroke()
    }
  }, [incomeData, expenseData, title, theme, isDark])

  return (
    <div className="h-full w-full relative">
      {incomeData.length === 0 && expenseData.length === 0 ? (
        <div className="h-[300px] w-full bg-muted/20 flex items-center justify-center rounded-md">
          <BarChart3Icon className="h-16 w-16 text-muted" />
          <span className="ml-2 text-muted-foreground">No prediction data available</span>
        </div>
      ) : (
        <canvas ref={canvasRef} width={800} height={300} className="w-full h-[300px]" />
      )}
    </div>
  )
}

