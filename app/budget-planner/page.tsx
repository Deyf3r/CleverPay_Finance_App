"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PieChart, ArrowLeft, Plus, Trash2, DollarSign, Percent, Save, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { useFinance } from "@/context/finance-context"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { PieChartComponent } from "@/components/charts/pie-chart"

interface Category {
  name: string
  percentage: number
  amount: number
  suggested: number
  actual?: number
}

export default function BudgetPlannerPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()
  const { state, isLoading, getTotalIncome, getTotalExpenses } = useFinance()
  const [activeTab, setActiveTab] = useState("overview")
  const [monthlyIncome, setMonthlyIncome] = useState("3500")
  const [savingsGoal, setSavingsGoal] = useState("20")
  const [budgetSaved, setBudgetSaved] = useState(false)

  // Calcular gastos reales por categoría basados en transacciones
  const calculateActualSpending = () => {
    const categorySpending: { [key: string]: number } = {}
    
    // Filtrar solo transacciones de gastos
    const expenses = state.transactions.filter(t => t.type === "expense")
    
    // Agrupar gastos por categoría
    expenses.forEach(transaction => {
      const category = transaction.category || "other"
      if (!categorySpending[category]) {
        categorySpending[category] = 0
      }
      categorySpending[category] += transaction.amount
    })
    
    return categorySpending
  }

  // Sample budget data with actual spending
  const [categories, setCategories] = useState<Category[]>([])

  // Inicializar categorías con datos reales cuando se cargan las transacciones
  useEffect(() => {
    if (!isLoading) {
      const actualSpending = calculateActualSpending()
      const income = parseFloat(monthlyIncome)
      
      const initialCategories: Category[] = [
        { name: "Vivienda", percentage: 30, amount: income * 0.3, suggested: income * 0.3, actual: actualSpending["housing"] || 0 },
        { name: "Alimentación", percentage: 15, amount: income * 0.15, suggested: income * 0.15, actual: actualSpending["food"] || 0 },
        { name: "Transporte", percentage: 10, amount: income * 0.1, suggested: income * 0.1, actual: actualSpending["transportation"] || 0 },
        { name: "Servicios", percentage: 10, amount: income * 0.1, suggested: income * 0.1, actual: actualSpending["utilities"] || 0 },
        { name: "Entretenimiento", percentage: 5, amount: income * 0.05, suggested: income * 0.05, actual: actualSpending["entertainment"] || 0 },
        { name: "Ahorros", percentage: 20, amount: income * 0.2, suggested: income * 0.2, actual: actualSpending["savings"] || 0 },
        { name: "Otros", percentage: 10, amount: income * 0.1, suggested: income * 0.1, actual: actualSpending["other"] || 0 },
      ]
      
      setCategories(initialCategories)
    }
  }, [isLoading, monthlyIncome, translate])

  const getProgressColor = (index: number) => {
    const colors = [
      "bg-purple-500 dark:bg-purple-600",
      "bg-blue-500 dark:bg-blue-600",
      "bg-emerald-500 dark:bg-emerald-600",
      "bg-amber-500 dark:bg-amber-600",
      "bg-rose-500 dark:bg-rose-600",
      "bg-indigo-500 dark:bg-indigo-600",
      "bg-teal-500 dark:bg-teal-600",
    ]
    return colors[index % colors.length]
  }

  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30",
      "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200 dark:border-teal-800/30",
    ]
    return colors[index % colors.length]
  }

  const handleCategoryChange = (index: number, field: keyof Category, value: string) => {
    const newCategories = [...categories]
    if (field === "name") {
      newCategories[index].name = value
    } else if (field === "percentage") {
      newCategories[index].percentage = parseFloat(value) || 0
      newCategories[index].amount = (parseFloat(monthlyIncome) * newCategories[index].percentage) / 100
    } else if (field === "amount") {
      newCategories[index].amount = parseFloat(value) || 0
      newCategories[index].percentage = (newCategories[index].amount / parseFloat(monthlyIncome)) * 100
    }
    setCategories(newCategories)
  }

  const handleMonthlyIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyIncome(e.target.value)
    const newCategories = [...categories]
    newCategories.forEach((category) => {
      category.amount = (parseFloat(e.target.value) * category.percentage) / 100
    })
    setCategories(newCategories)
  }

  const handleSavingsGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavingsGoal(e.target.value)
    const newCategories = [...categories]
    newCategories.forEach((category) => {
      category.amount = (parseFloat(monthlyIncome) * category.percentage) / 100
    })
    setCategories(newCategories)
  }

  const handleAddCategory = () => {
    setCategories([
      ...categories,
      { name: "Nueva Categoría", percentage: 0, amount: 0, suggested: 0 }
    ])
  }

  const handleDeleteCategory = (index: number) => {
    const newCategories = [...categories]
    newCategories.splice(index, 1)
    setCategories(newCategories)
  }

  const handleSaveBudget = () => {
    // Aquí se implementaría la lógica para guardar el presupuesto
    // Por ahora solo mostramos un toast de confirmación
    toast.success("Presupuesto guardado correctamente")
    setBudgetSaved(true)
  }

  // Preparar datos para el gráfico de pastel
  const pieChartData = categories.map((category, index) => ({
    name: category.name,
    value: category.percentage,
    color: getProgressColor(index).replace('bg-', '').replace(' dark:bg-', '/')
  }))

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/ai-insights")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Planificador de Presupuesto
            </h1>
            <p className="text-muted-foreground">Crea y gestiona tu presupuesto mensual</p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          onClick={handleSaveBudget}
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar Presupuesto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Ingreso Mensual</CardTitle>
            <CardDescription>Ingresa tu ingreso mensual total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={monthlyIncome}
                onChange={handleMonthlyIncomeChange}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta de Ahorro</CardTitle>
            <CardDescription>Porcentaje de tus ingresos que quieres ahorrar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={savingsGoal}
                onChange={handleSavingsGoalChange}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculadora</CardTitle>
            <CardDescription>Resumen de tu presupuesto mensual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ingreso Mensual:</span>
                <span className="font-mono">{formatCurrency(parseFloat(monthlyIncome))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Meta de Ahorro:</span>
                <span className="font-mono">{formatCurrency((parseFloat(monthlyIncome) * parseFloat(savingsGoal)) / 100)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-sm">Ingreso Disponible:</span>
                <span className="font-mono">
                  {formatCurrency(parseFloat(monthlyIncome) - (parseFloat(monthlyIncome) * parseFloat(savingsGoal)) / 100)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="detailed">Detallado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Distribución del Presupuesto</CardTitle>
              <CardDescription>Cómo se distribuye tu presupuesto por categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="aspect-square max-w-sm mx-auto h-[350px]">
                  {categories.length > 0 ? (
                    <PieChartComponent data={pieChartData} />
                  ) : (
                    <PieChart className="w-full h-full text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getBadgeColor(index)}>
                          {category.name}
                        </Badge>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={category.percentage}
                          className="h-2"
                          indicatorClassName={getProgressColor(index + 4)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(category.amount)}</span>
                          <div className="flex gap-2">
                            {category.actual !== undefined && (
                              <span className={category.actual > category.amount ? "text-rose-500" : "text-emerald-500"}>
                                Actual: {formatCurrency(category.actual)}
                              </span>
                            )}
                            <span>
                              Sugerido: {formatCurrency(category.suggested)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={() => setActiveTab("detailed")}
              >
                Personalizar
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorías</CardTitle>
              <CardDescription>Personaliza las categorías de tu presupuesto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                  <div className="col-span-5">Categoría</div>
                  <div className="col-span-3">Porcentaje</div>
                  <div className="col-span-3">Monto</div>
                  <div className="col-span-1"></div>
                </div>

                {categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <Input
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        value={category.percentage.toString()}
                        onChange={(e) => handleCategoryChange(index, "percentage", e.target.value)}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        value={category.amount.toString()}
                        onChange={(e) => handleCategoryChange(index, "amount", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCategory(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4" size="sm" onClick={handleAddCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Categoría
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setActiveTab("overview")}>
                Volver al Resumen
              </Button>
              <Button 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={handleSaveBudget}
              >
                Guardar Presupuesto
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
