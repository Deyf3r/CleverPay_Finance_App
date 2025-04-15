"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, AlertTriangle, DollarSign, PiggyBank, CreditCard } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { motion } from "framer-motion"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

// Datos de ejemplo para las predicciones
const predictionData = {
  spending: {
    current: 2850,
    predicted: 3100,
    change: 8.77,
    categories: [
      { name: "Comida", current: 650, predicted: 680, change: 4.62 },
      { name: "Transporte", current: 450, predicted: 520, change: 15.56 },
      { name: "Entretenimiento", current: 350, predicted: 400, change: 14.29 },
      { name: "Servicios", current: 800, predicted: 850, change: 6.25 },
      { name: "Compras", current: 600, predicted: 650, change: 8.33 },
    ],
    anomalies: [
      { category: "Transporte", severity: "high", message: "Aumento significativo en gastos de transporte" },
      { category: "Entretenimiento", severity: "medium", message: "Incremento moderado en entretenimiento" },
    ],
  },
  income: {
    current: 4500,
    predicted: 4650,
    change: 3.33,
    sources: [
      { name: "Salario", current: 4000, predicted: 4000, change: 0 },
      { name: "Freelance", current: 500, predicted: 650, change: 30 },
    ],
  },
  savings: {
    current: 1650,
    predicted: 1550,
    change: -6.06,
    goal: 2000,
    progress: 77.5,
  },
}

export function PredictionInsights() {
  const { translate } = useSettings()
  const [activeTab, setActiveTab] = useState("spending")
  const [showDetails, setShowDetails] = useState(false)

  // Animación para los números
  const [counts, setCounts] = useState({
    spending: 0,
    income: 0,
    savings: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts((prev) => ({
        spending: Math.min(prev.spending + 100, predictionData.spending.predicted),
        income: Math.min(prev.income + 150, predictionData.income.predicted),
        savings: Math.min(prev.savings + 50, predictionData.savings.predicted),
      }))
    }, 20)

    return () => clearInterval(interval)
  }, [])

  // Función para renderizar el indicador de cambio
  const renderChangeIndicator = (change) => {
    const isPositive = change > 0
    const isNegative = change < 0
    const isNeutral = change === 0

    // Determinar si el cambio positivo es bueno o malo según el contexto
    const isPositiveGood = activeTab === "income" || activeTab === "savings"
    const isNegativeGood = activeTab === "spending"

    // Determinar el color del badge
    let badgeVariant = "outline"
    if ((isPositive && isPositiveGood) || (isNegative && isNegativeGood)) {
      badgeVariant = "success"
    } else if ((isPositive && !isPositiveGood) || (isNegative && !isNegativeGood)) {
      badgeVariant = "destructive"
    }

    return (
      <Badge variant={badgeVariant} className="ml-2">
        {isPositive && "+"}
        {isNegative ? "-" : ""}
        {Math.abs(change).toFixed(2)}%
      </Badge>
    )
  }

  // Función para renderizar el contenido de la pestaña de gastos
  const renderSpendingTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">{translate("predictions.predicted_spending")}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold">${counts.spending.toFixed(2)}</span>
            {renderChangeIndicator(predictionData.spending.change)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {translate("predictions.compared_to")} ${predictionData.spending.current.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {predictionData.spending.anomalies.map((anomaly, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge
                variant={anomaly.severity === "high" ? "destructive" : "warning"}
                className="flex items-center gap-1 py-1.5 px-3"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {anomaly.category}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator />

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium">{translate("predictions.category_breakdown")}</h4>
          <div className="space-y-3">
            {predictionData.spending.categories.map((category, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm">${category.predicted}</span>
                    {renderChangeIndicator(category.change)}
                  </div>
                </div>
                <Progress value={category.predicted / 10} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? translate("common.hide_details") : translate("common.show_details")}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary">
                <Link href="/ai-insights" className="flex items-center gap-1">
                  {translate("common.view_full_analysis")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{translate("predictions.view_detailed_spending_analysis")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )

  // Función para renderizar el contenido de la pestaña de ingresos
  const renderIncomeTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{translate("predictions.predicted_income")}</h3>
        <div className="flex items-baseline mt-1">
          <span className="text-3xl font-bold">${counts.income.toFixed(2)}</span>
          {renderChangeIndicator(predictionData.income.change)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {translate("predictions.compared_to")} ${predictionData.income.current.toFixed(2)}
        </p>
      </div>

      <Separator />

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <h4 className="font-medium">{translate("predictions.income_sources")}</h4>
          <div className="space-y-3">
            {predictionData.income.sources.map((source, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{source.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm">${source.predicted}</span>
                    {renderChangeIndicator(source.change)}
                  </div>
                </div>
                <Progress value={source.predicted / 50} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? translate("common.hide_details") : translate("common.show_details")}
        </Button>
        <Button variant="ghost" size="sm" className="text-primary">
          <Link href="/ai-insights" className="flex items-center gap-1">
            {translate("common.view_full_analysis")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )

  // Función para renderizar el contenido de la pestaña de ahorros
  const renderSavingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{translate("predictions.predicted_savings")}</h3>
        <div className="flex items-baseline mt-1">
          <span className="text-3xl font-bold">${counts.savings.toFixed(2)}</span>
          {renderChangeIndicator(predictionData.savings.change)}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {translate("predictions.compared_to")} ${predictionData.savings.current.toFixed(2)}
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{translate("predictions.savings_goal")}</span>
          <span className="text-sm">${predictionData.savings.goal}</span>
        </div>
        <Progress value={predictionData.savings.progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {predictionData.savings.progress.toFixed(1)}% {translate("predictions.of_monthly_goal")}
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href="/emergency-fund">{translate("predictions.optimize_savings")}</Link>
        </Button>
        <Button variant="ghost" size="sm" className="text-primary" asChild>
          <Link href="/ai-insights" className="flex items-center gap-1">
            {translate("common.view_full_analysis")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          {translate("predictions.ai_predictions")}
        </CardTitle>
        <CardDescription>{translate("predictions.next_month_forecast")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value)
            setShowDetails(false)
          }}
        >
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="spending" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              {translate("common.spending")}
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {translate("common.income")}
            </TabsTrigger>
            <TabsTrigger value="savings" className="flex items-center gap-1">
              <PiggyBank className="h-4 w-4" />
              {translate("common.savings")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="spending">{renderSpendingTab()}</TabsContent>
          <TabsContent value="income">{renderIncomeTab()}</TabsContent>
          <TabsContent value="savings">{renderSavingsTab()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default PredictionInsights
