"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangleIcon, InfoIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { useFinance } from "@/context/finance-context"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { format, subMonths, parseISO } from "date-fns"
import { useRouter } from "next/navigation"

interface AnomalyProps {
  anomalies?: {
    category: string
    amount: number
    percentageIncrease: number
    averageAmount: number
    description: string
  }[]
  useDynamicData?: boolean
}

export default function SpendingAnomalies({ anomalies: propAnomalies, useDynamicData = true }: AnomalyProps) {
  const { formatCurrency, translate } = useSettings()
  const { state, isLoading } = useFinance()
  const router = useRouter()
  const [anomalies, setAnomalies] = useState(propAnomalies || [])
  const [isCalculating, setIsCalculating] = useState(useDynamicData && !propAnomalies)

  // Calcular anomalías de gastos basadas en transacciones reales
  useEffect(() => {
    if (!useDynamicData || propAnomalies || isLoading) return

    setIsCalculating(true)
    
    // Función para calcular anomalías
    const calculateAnomalies = () => {
      // Obtener fecha actual y fecha de hace 3 meses
      const currentDate = new Date()
      const threeMonthsAgo = subMonths(currentDate, 3)
      
      // Filtrar transacciones de gastos
      const expenses = state.transactions.filter(t => t.type === "expense")
      
      // Agrupar gastos por categoría y por mes
      const categoryMonthlySpending: Record<string, Record<string, number>> = {}
      
      expenses.forEach(transaction => {
        const category = transaction.category || "other"
        const transactionDate = typeof transaction.date === 'string' 
          ? parseISO(transaction.date) 
          : transaction.date
        
        // Solo considerar transacciones de los últimos 3 meses
        if (transactionDate < threeMonthsAgo) return
        
        const month = format(transactionDate, "yyyy-MM")
        
        if (!categoryMonthlySpending[category]) {
          categoryMonthlySpending[category] = {}
        }
        
        if (!categoryMonthlySpending[category][month]) {
          categoryMonthlySpending[category][month] = 0
        }
        
        categoryMonthlySpending[category][month] += transaction.amount
      })
      
      // Calcular anomalías
      const currentMonth = format(currentDate, "yyyy-MM")
      const detectedAnomalies = []
      
      for (const category in categoryMonthlySpending) {
        const monthlyData = categoryMonthlySpending[category]
        const currentMonthAmount = monthlyData[currentMonth] || 0
        
        // Si no hay gastos en el mes actual, no hay anomalía
        if (currentMonthAmount === 0) continue
        
        // Calcular el promedio de los meses anteriores
        let totalPreviousMonths = 0
        let countPreviousMonths = 0
        
        for (const month in monthlyData) {
          if (month !== currentMonth) {
            totalPreviousMonths += monthlyData[month]
            countPreviousMonths++
          }
        }
        
        // Si no hay datos de meses anteriores, no podemos calcular anomalías
        if (countPreviousMonths === 0) continue
        
        const averageAmount = totalPreviousMonths / countPreviousMonths
        
        // Calcular el porcentaje de aumento
        const percentageIncrease = ((currentMonthAmount - averageAmount) / averageAmount) * 100
        
        // Considerar como anomalía si el aumento es mayor al 30%
        if (percentageIncrease > 30) {
          detectedAnomalies.push({
            category,
            amount: currentMonthAmount,
            percentageIncrease,
            averageAmount,
            description: getAnomalyDescription(category, percentageIncrease)
          })
        }
      }
      
      // Ordenar anomalías por porcentaje de aumento (descendente)
      return detectedAnomalies.sort((a, b) => b.percentageIncrease - a.percentageIncrease)
    }
    
    // Generar descripciones personalizadas para las anomalías
    const getAnomalyDescription = (category: string, percentageIncrease: number) => {
      const descriptions = [
        `Tus gastos en ${translate(`category.${category}`)} han aumentado un ${percentageIncrease.toFixed(0)}% respecto a tu promedio habitual.`,
        `Has gastado más de lo normal en ${translate(`category.${category}`)} este mes.`,
        `Se detectó un incremento significativo en tus gastos de ${translate(`category.${category}`)}.`
      ]
      
      return descriptions[Math.floor(Math.random() * descriptions.length)]
    }
    
    // Calcular anomalías
    const calculatedAnomalies = calculateAnomalies()
    setAnomalies(calculatedAnomalies)
    setIsCalculating(false)
  }, [state.transactions, isLoading, propAnomalies, useDynamicData, translate])

  const getCategoryLabel = (category: string) => {
    return translate(`category.${category}`)
  }
  
  const handleCreateBudget = () => {
    router.push("/budget-planner")
  }

  if (isLoading || isCalculating) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("ai.spending_anomalies")}</CardTitle>
          <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <p>{translate("common.loading")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (anomalies.length === 0) {
    return (
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-lg">{translate("ai.spending_anomalies")}</CardTitle>
          <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3 mb-3">
              <TrendingDownIcon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p>{translate("ai.no_anomalies")}</p>
            <p className="text-sm mt-1">{translate("ai.consistent_patterns")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card">
      <CardHeader>
        <CardTitle className="text-lg">{translate("ai.spending_anomalies")}</CardTitle>
        <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {anomalies.map((anomaly, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-rose-100 dark:bg-rose-900 p-2">
                  <AlertTriangleIcon className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{getCategoryLabel(anomaly.category)}</p>
                  <p className="text-xs text-muted-foreground">
                    {anomaly.percentageIncrease.toFixed(0)}% {translate("ai.increase_from_last")}
                  </p>
                </div>
                <div className="font-medium text-rose-500 dark:text-rose-400">{formatCurrency(anomaly.amount)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{translate("ai.average_spending")}</span>
                  <span className="font-medium">{formatCurrency(anomaly.averageAmount)}</span>
                </div>
                <Progress
                  value={Math.min(100, (anomaly.averageAmount / anomaly.amount) * 100)}
                  className="h-1.5 bg-muted"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{translate("ai.current_spending")}</span>
                  <span className="font-medium">{formatCurrency(anomaly.amount)}</span>
                </div>
              </div>

              <div className="flex items-start text-xs mt-2">
                <InfoIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{anomaly.description}</p>
              </div>

              {index < anomalies.length - 1 && <div className="border-t border-border my-3"></div>}
            </div>
          ))}
          
          <Button 
            onClick={handleCreateBudget}
            className="w-full mt-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white"
          >
            {translate("budget.create_budget")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
