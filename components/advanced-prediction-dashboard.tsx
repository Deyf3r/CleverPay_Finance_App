"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  BarChartIcon,
  LineChartIcon,
  Activity,
  Minus,
  Info,
  ChevronDown,
  Lightbulb,
  Zap,
  Target,
  Clock,
  Percent,
  Loader2,
} from "lucide-react"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import {
  predictExpenses,
  predictIncome,
  identifyAnomalousSpending,
  suggestSavingsGoals,
  generateFinancialInsights,
  type ExpensePrediction,
  type IncomePrediction,
} from "@/utils/enhanced-ai-predictions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function AdvancedPredictionDashboard() {
  const { state } = useFinance()
  const { formatCurrency } = useSettings()

  // Prediction state
  const [expensePredictions, setExpensePredictions] = useState<ExpensePrediction[]>([])
  const [incomePredictions, setIncomePredictions] = useState<IncomePrediction[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [savingsGoal, setSavingsGoal] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [chartType, setChartType] = useState<"bar" | "line" | "area">("area")
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true)
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null)

  // Generate predictions
  useEffect(() => {
    const generatePredictions = async () => {
      setIsLoading(true)

      try {
        // Add a delay to simulate AI processing
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Generate predictions
        const expenses = predictExpenses(state.transactions, 6)
        const income = predictIncome(state.transactions, 6)
        const anomalousSpending = identifyAnomalousSpending(state.transactions)
        const savings = suggestSavingsGoals(state.transactions)
        const financialInsights = generateFinancialInsights(state.transactions)

        setExpensePredictions(expenses)
        setIncomePredictions(income)
        setAnomalies(anomalousSpending)
        setSavingsGoal(savings)
        setInsights(financialInsights)
      } catch (error) {
        console.error("Error generating predictions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    generatePredictions()
  }, [state.transactions])

  // Prepare chart data
  const prepareChartData = () => {
    if (expensePredictions.length === 0 || incomePredictions.length === 0) return []

    return expensePredictions.map((expense, index) => {
      const income = incomePredictions[index] || { amount: 0, confidence: 0 }

      // Calcular intervalos de confianza ajustados por el nivel de volatilidad
      // Intervalos más amplios cuando la volatilidad es alta
      const volatilityFactor = Math.max(expense.volatility, income.volatility)
      const confidenceMultiplier = 1 + volatilityFactor * 0.5

      const expenseConfidenceInterval = expense.amount * (1 - expense.confidence) * confidenceMultiplier
      const incomeConfidenceInterval = income.amount * (1 - income.confidence) * confidenceMultiplier

      // Asegurar que el intervalo inferior no sea negativo
      const expensesLower = Math.max(0, expense.amount - expenseConfidenceInterval)
      const incomeLower = Math.max(0, income.amount - incomeConfidenceInterval)

      // Calcular ahorros y sus intervalos
      const savings = Math.max(0, incomeLower - expense.amount)
      const savingsLower = Math.max(0, incomeLower - expense.amount)
      const savingsUpper = Math.max(0, income.amount - expensesLower)

      // Detección de riesgo financiero
      const financialRisk =
        income.amount * 0.9 < expense.amount ? "high" : income.amount * 0.75 < expense.amount ? "medium" : "low"

      // Calcular tasa de ahorro (porcentaje de ingresos)
      const savingsRate = income.amount > 0 ? (savings / income.amount) * 100 : 0

      return {
        month: expense.month,
        expenses: expense.amount,
        income: income.amount,
        savings,
        savingsRate,
        expensesLower,
        expensesUpper: expense.amount + expenseConfidenceInterval,
        incomeLower,
        incomeUpper: income.amount + incomeConfidenceInterval,
        savingsLower,
        savingsUpper,
        expenseConfidence: expense.confidence,
        incomeConfidence: income.confidence,
        expenseTrend: expense.trend,
        incomeTrend: income.trend,
        financialRisk,
        volatility: volatilityFactor,
      }
    })
  }

  const chartData = prepareChartData()

  // Prepare category data
  const prepareCategoryData = () => {
    if (expensePredictions.length === 0) return []

    const nextMonth = expensePredictions[0]
    const categories = nextMonth.categories

    return Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / nextMonth.amount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  const categoryData = prepareCategoryData()

  // Prepare recurring expenses data
  const prepareRecurringExpensesData = () => {
    if (expensePredictions.length === 0) return []

    const nextMonth = expensePredictions[0]
    return nextMonth.recurringExpenses
  }

  const recurringExpenses = prepareRecurringExpensesData()

  // Prepare seasonal factors data
  const prepareSeasonalFactorsData = () => {
    if (expensePredictions.length === 0) return []

    const factors = expensePredictions[0].seasonalFactors

    return Object.entries(factors)
      .map(([month, factor]) => ({
        month,
        factor,
        impact: (factor - 1) * 100,
      }))
      .sort((a, b) => b.factor - a.factor)
  }

  const seasonalFactors = prepareSeasonalFactorsData()

  // Prepare savings scenarios data
  const prepareSavingsScenarios = () => {
    if (!savingsGoal) return []

    return savingsGoal.scenarios
  }

  const savingsScenarios = prepareSavingsScenarios()

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Predicciones Financieras</h2>
            <p className="text-sm text-muted-foreground">
              Analizando tus datos financieros para generar predicciones personalizadas...
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-[120px]" />
              <Skeleton className="h-4 w-full mt-4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-[120px]" />
              <Skeleton className="h-4 w-full mt-4" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[150px]" />
              </CardTitle>
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-[120px]" />
              <Skeleton className="h-4 w-full mt-4" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="px-2">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>

        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Procesando datos financieros con IA avanzada...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Predicciones Financieras</h2>
            <p className="text-sm text-muted-foreground">
              Análisis avanzado de tus finanzas con inteligencia artificial
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1"
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
            >
              {showConfidenceInterval ? "Ocultar" : "Mostrar"} Intervalos
              <Info className="h-3.5 w-3.5" />
            </Button>
            <div className="border rounded-md p-1 flex gap-1">
              <Button
                variant={chartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setChartType("bar")}
              >
                <BarChartIcon className="h-4 w-4" />
                <span className="sr-only">Gráfico de barras</span>
              </Button>
              <Button
                variant={chartType === "line" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setChartType("line")}
              >
                <LineChartIcon className="h-4 w-4" />
                <span className="sr-only">Gráfico de líneas</span>
              </Button>
              <Button
                variant={chartType === "area" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setChartType("area")}
              >
                <Activity className="h-4 w-4" />
                <span className="sr-only">Gráfico de área</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="income">Ingresos</TabsTrigger>
            <TabsTrigger value="savings">Ahorros</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos Previstos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(expensePredictions[0]?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    {expensePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+{expensePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : expensePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>-{expensePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Próximo mes</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className="font-medium">{Math.round(expensePredictions[0]?.confidence * 100)}%</span>
                    </div>
                    <Progress value={expensePredictions[0]?.confidence * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Previstos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(incomePredictions[0]?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    {incomePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+{incomePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : incomePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>-{incomePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Próximo mes</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className="font-medium">{Math.round(incomePredictions[0]?.confidence * 100)}%</span>
                    </div>
                    <Progress value={incomePredictions[0]?.confidence * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ahorro Recomendado</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(savingsGoal?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      <span>{savingsGoal?.savingsRate.toFixed(1)}% de ingresos</span>
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Confianza</span>
                      <span className="font-medium">{Math.round(savingsGoal?.confidence * 100)}%</span>
                    </div>
                    <Progress value={savingsGoal?.confidence * 100} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>Proyección Financiera</CardTitle>
                  <CardDescription>Predicción de ingresos y gastos para los próximos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="px-2">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, ""]} />
                          <Legend />
                          <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="savings" name="Ahorros" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : chartType === "line" ? (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, ""]} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="income"
                            name="Ingresos"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="expenses"
                            name="Gastos"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="savings"
                            name="Ahorros"
                            stroke="#6366f1"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                          {showConfidenceInterval && (
                            <>
                              <Line
                                type="monotone"
                                dataKey="incomeLower"
                                name="Intervalo Inferior (Ingresos)"
                                stroke="#10b981"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                                activeDot={false}
                                strokeOpacity={0.5}
                              />
                              <Line
                                type="monotone"
                                dataKey="incomeUpper"
                                name="Intervalo Superior (Ingresos)"
                                stroke="#10b981"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                                activeDot={false}
                                strokeOpacity={0.5}
                              />
                              <Line
                                type="monotone"
                                dataKey="expensesLower"
                                name="Intervalo Inferior (Gastos)"
                                stroke="#ef4444"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                                activeDot={false}
                                strokeOpacity={0.5}
                              />
                              <Line
                                type="monotone"
                                dataKey="expensesUpper"
                                name="Intervalo Superior (Gastos)"
                                stroke="#ef4444"
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                                activeDot={false}
                                strokeOpacity={0.5}
                              />
                            </>
                          )}
                        </LineChart>
                      ) : (
                        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => [`$${value}`, ""]} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="income"
                            name="Ingresos"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            name="Gastos"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="savings"
                            name="Ahorros"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.2}
                            strokeWidth={2}
                            activeDot={{ r: 6 }}
                          />
                          {showConfidenceInterval && (
                            <>
                              <Area
                                type="monotone"
                                dataKey="incomeLower"
                                name="Intervalo Inferior (Ingresos)"
                                stroke="none"
                                fill="#10b981"
                                fillOpacity={0.1}
                                activeDot={false}
                              />
                              <Area
                                type="monotone"
                                dataKey="incomeUpper"
                                name="Intervalo Superior (Ingresos)"
                                stroke="none"
                                fill="#10b981"
                                fillOpacity={0.1}
                                activeDot={false}
                              />
                              <Area
                                type="monotone"
                                dataKey="expensesLower"
                                name="Intervalo Inferior (Gastos)"
                                stroke="none"
                                fill="#ef4444"
                                fillOpacity={0.1}
                                activeDot={false}
                              />
                              <Area
                                type="monotone"
                                dataKey="expensesUpper"
                                name="Intervalo Superior (Gastos)"
                                stroke="none"
                                fill="#ef4444"
                                fillOpacity={0.1}
                                activeDot={false}
                              />
                            </>
                          )}
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  {showConfidenceInterval && (
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      <span>Las áreas sombreadas representan los intervalos de confianza de las predicciones</span>
                    </div>
                  )}
                </CardFooter>
              </Card>

              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Distribución de Gastos</CardTitle>
                  <CardDescription>Predicción para el próximo mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                          nameKey="category"
                          label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#ef4444",
                                  "#f97316",
                                  "#f59e0b",
                                  "#10b981",
                                  "#06b6d4",
                                  "#6366f1",
                                  "#8b5cf6",
                                  "#d946ef",
                                ][index % 8]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`$${value}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Gastos Recurrentes</CardTitle>
                  <CardDescription>Predicción de gastos recurrentes para el próximo mes</CardDescription>
                </CardHeader>
                <CardContent>
                  {recurringExpenses.length > 0 ? (
                    <div className="space-y-4">
                      {recurringExpenses.map((expense, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{expense.description}</p>
                            <p className="text-sm text-muted-foreground">{expense.category}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-bold">{formatCurrency(expense.amount)}</span>
                            <Badge variant="outline" className="text-xs">
                              {Math.round(expense.confidence * 100)}% confianza
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No se detectaron gastos recurrentes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomalías Detectadas</CardTitle>
                  <CardDescription>Gastos inusuales que requieren atención</CardDescription>
                </CardHeader>
                <CardContent>
                  {anomalies.length > 0 ? (
                    <div className="space-y-4">
                      {anomalies.slice(0, 3).map((anomaly, index) => (
                        <div key={index} className="flex items-start justify-between">
                          <div className="space-y-1 flex items-start gap-2">
                            <div
                              className={cn(
                                "mt-0.5 p-1 rounded-full",
                                anomaly.severity === "high"
                                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                  : anomaly.severity === "medium"
                                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
                              )}
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </div>
                            <div>
                              <p className="text-sm font-medium leading-none">{anomaly.category}</p>
                              <p className="text-xs text-muted-foreground mt-1">{anomaly.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-bold">{formatCurrency(anomaly.amount)}</span>
                            <span className="text-xs text-red-600 dark:text-red-400">
                              +{anomaly.percentageIncrease.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center">
                      <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No se detectaron anomalías</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gastos Previstos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(expensePredictions[0]?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    {expensePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+{expensePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : expensePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>-{expensePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Próximo mes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volatilidad</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(expensePredictions[0]?.volatility * 100).toFixed(1)}%</div>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        expensePredictions[0]?.volatility < 0.1
                          ? "outline"
                          : expensePredictions[0]?.volatility < 0.2
                            ? "secondary"
                            : "destructive"
                      }
                      className="gap-1"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>
                        {expensePredictions[0]?.volatility < 0.1
                          ? "Baja"
                          : expensePredictions[0]?.volatility < 0.2
                            ? "Media"
                            : "Alta"}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">Variabilidad</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confianza</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(expensePredictions[0]?.confidence * 100)}%</div>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        expensePredictions[0]?.confidence < 0.7
                          ? "destructive"
                          : expensePredictions[0]?.confidence < 0.9
                            ? "secondary"
                            : "outline"
                      }
                      className="gap-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>
                        {expensePredictions[0]?.confidence < 0.7
                          ? "Baja"
                          : expensePredictions[0]?.confidence < 0.9
                            ? "Media"
                            : "Alta"}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">Precisión</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {expensePredictions[0]?.trend === "increasing"
                      ? "Aumento"
                      : expensePredictions[0]?.trend === "decreasing"
                        ? "Descenso"
                        : "Estable"}
                  </div>
                  <div className="flex items-center mt-1">
                    {expensePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Creciente</span>
                      </Badge>
                    ) : expensePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Decreciente</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Dirección</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Gastos</CardTitle>
                <CardDescription>Predicción para el próximo mes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={160}
                        fill="#8884d8"
                        dataKey="amount"
                        nameKey="category"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#8b5cf6", "#d946ef"][
                                index % 8
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gastos Recurrentes</CardTitle>
                <CardDescription>Predicción de gastos recurrentes para el próximo mes</CardDescription>
              </CardHeader>
              <CardContent>
                {recurringExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {recurringExpenses.map((expense, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{expense.description}</p>
                          <p className="text-sm text-muted-foreground">{expense.category}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold">{formatCurrency(expense.amount)}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(expense.confidence * 100)}% confianza
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No se detectaron gastos recurrentes</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Factores Estacionales</CardTitle>
                <CardDescription>Impacto de la estacionalidad en los gastos</CardDescription>
              </CardHeader>
              <CardContent>
                {seasonalFactors.length > 0 ? (
                  <div className="space-y-4">
                    {seasonalFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{factor.month}</p>
                          <p className="text-sm text-muted-foreground">Impacto: {factor.impact.toFixed(1)}%</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold">{factor.factor.toFixed(2)}</span>
                          <Badge variant="outline" className="text-xs">
                            Factor
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No se detectaron factores estacionales</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Previstos</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(incomePredictions[0]?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    {incomePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>+{incomePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : incomePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>-{incomePredictions[0]?.volatility.toFixed(1)}%</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Próximo mes</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volatilidad</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(incomePredictions[0]?.volatility * 100).toFixed(1)}%</div>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        incomePredictions[0]?.volatility < 0.1
                          ? "outline"
                          : incomePredictions[0]?.volatility < 0.2
                            ? "secondary"
                            : "destructive"
                      }
                      className="gap-1"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span>
                        {incomePredictions[0]?.volatility < 0.1
                          ? "Baja"
                          : incomePredictions[0]?.volatility < 0.2
                            ? "Media"
                            : "Alta"}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">Variabilidad</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confianza</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(incomePredictions[0]?.confidence * 100)}%</div>
                  <div className="flex items-center mt-1">
                    <Badge
                      variant={
                        incomePredictions[0]?.confidence < 0.7
                          ? "destructive"
                          : incomePredictions[0]?.confidence < 0.9
                            ? "secondary"
                            : "outline"
                      }
                      className="gap-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>
                        {incomePredictions[0]?.confidence < 0.7
                          ? "Baja"
                          : incomePredictions[0]?.confidence < 0.9
                            ? "Media"
                            : "Alta"}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">Precisión</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {incomePredictions[0]?.trend === "increasing"
                      ? "Aumento"
                      : incomePredictions[0]?.trend === "decreasing"
                        ? "Descenso"
                        : "Estable"}
                  </div>
                  <div className="flex items-center mt-1">
                    {incomePredictions[0]?.trend === "increasing" ? (
                      <Badge variant="success" className="gap-1 bg-green-600">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Creciente</span>
                      </Badge>
                    ) : incomePredictions[0]?.trend === "decreasing" ? (
                      <Badge variant="destructive" className="gap-1">
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Decreciente</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Minus className="h-3.5 w-3.5" />
                        <span>Estable</span>
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-2">Dirección</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Historial de Ingresos</CardTitle>
                <CardDescription>Ingresos de los últimos meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, ""]} />
                      <Legend />
                      <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="savings" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ahorro Recomendado</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(savingsGoal?.amount || 0)}</div>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="gap-1">
                      <Percent className="h-3.5 w-3.5" />
                      <span>{savingsGoal?.savingsRate.toFixed(1)}% de ingresos</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confianza</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(savingsGoal?.confidence * 100)}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plazo</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{savingsGoal?.timeframe} meses</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Escenarios de Ahorro</CardTitle>
                <CardDescription>Diferentes escenarios para alcanzar tus metas de ahorro</CardDescription>
              </CardHeader>
              <CardContent>
                {savingsScenarios.length > 0 ? (
                  <div className="space-y-4">
                    {savingsScenarios.map((scenario, index) => (
                      <Collapsible key={index} className="border rounded-md">
                        <CollapsibleTrigger className="flex items-center justify-between p-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{scenario.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Ahorro mensual: {formatCurrency(scenario.monthlySavings)}
                            </p>
                          </div>
                          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform duration-200 peer-data-[state=open]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="p-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">{scenario.details}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Impacto en gastos:</p>
                              <span className="font-bold">{scenario.impactOnExpenses.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">Confianza:</p>
                              <span className="font-bold">{Math.round(scenario.confidence * 100)}%</span>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center">
                    <Target className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No se encontraron escenarios de ahorro</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumen Financiero</CardTitle>
                    <CardDescription>Análisis general de tu situación financiera</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{insights.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recomendaciones Personalizadas</CardTitle>
                    <CardDescription>Sugerencias para mejorar tu salud financiera</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {insights.recommendations.map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Áreas de Mejora</CardTitle>
                    <CardDescription>Identificación de áreas donde puedes optimizar tus finanzas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {insights.areasForImprovement.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Lightbulb className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No se encontraron insights financieros</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {chartData.map(
        (data, index) =>
          data.financialRisk === "high" && (
            <div
              key={`risk-${index}`}
              className="absolute"
              style={{
                left: `${(index / (chartData.length - 1)) * 100}%`,
                bottom: 0,
                height: "100%",
                width: "4px",
              }}
            >
              <div className="h-full w-1 bg-red-500/20" title={`Alto riesgo financiero en ${data.month}`} />
            </div>
          ),
      )}
    </TooltipProvider>
  )
}
