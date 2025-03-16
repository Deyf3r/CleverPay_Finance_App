"use client"

import { useEffect, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { BarChart3Icon } from "lucide-react"

// This is a simplified chart component
// In a real app, you would use a library like Chart.js, Recharts, or D3.js
export default function FinanceChart() {
  const { getMonthlyData } = useFinance()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    const monthlyData = getMonthlyData()
    if (monthlyData.length === 0) return

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // Set dimensions
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Find max value for scaling
    const maxValue = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expenses)))

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.strokeStyle = "#94a3b8"
    ctx.stroke()

    // Draw bars
    const barWidth = chartWidth / (monthlyData.length * 2)
    const gap = barWidth / 2

    monthlyData.forEach((data, i) => {
      const x = padding + i * (barWidth * 2 + gap)

      // Income bar
      const incomeHeight = (data.income / maxValue) * chartHeight
      ctx.fillStyle = "#10b981"
      ctx.fillRect(x, height - padding - incomeHeight, barWidth, incomeHeight)

      // Expense bar
      const expenseHeight = (data.expenses / maxValue) * chartHeight
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(x + barWidth + gap, height - padding - expenseHeight, barWidth, expenseHeight)

      // Draw month label
      ctx.fillStyle = "#64748b"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(data.month, x + barWidth + gap / 2, height - padding + 15)
    })

    // Draw legend
    ctx.fillStyle = "#10b981"
    ctx.fillRect(width - padding - 100, padding, 10, 10)
    ctx.fillStyle = "#ef4444"
    ctx.fillRect(width - padding - 100, padding + 20, 10, 10)

    ctx.fillStyle = "#64748b"
    ctx.textAlign = "left"
    ctx.fillText("Income", width - padding - 85, padding + 8)
    ctx.fillText("Expenses", width - padding - 85, padding + 28)
  }, [getMonthlyData])

  return (
    <div className="h-full w-full relative">
      {getMonthlyData().length === 0 ? (
        <div className="h-[300px] w-full bg-muted/20 flex items-center justify-center rounded-md">
          <BarChart3Icon className="h-16 w-16 text-muted" />
          <span className="ml-2 text-muted-foreground">No data available</span>
        </div>
      ) : (
        <canvas ref={canvasRef} width={800} height={300} className="w-full h-[300px]" />
      )}
    </div>
  )
}

