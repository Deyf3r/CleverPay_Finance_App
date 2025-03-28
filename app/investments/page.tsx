"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, PieChart, DollarSign, BarChart4, Clock, Info, ChevronRight, Plus } from "lucide-react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function InvestmentsPage() {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [showAddInvestmentDialog, setShowAddInvestmentDialog] = useState(false)
  const [newInvestmentName, setNewInvestmentName] = useState("")
  const [newInvestmentAmount, setNewInvestmentAmount] = useState("")
  const [newInvestmentType, setNewInvestmentType] = useState("stock")

  // Calcular ahorros actuales del mes
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthIncome = state.transactions
    .filter((t) => {
      const date = new Date(t.date)
      return t.type === "income" && date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const currentMonthExpenses = state.transactions
    .filter((t) => {
      const date = new Date(t.date)
      return t.type === "expense" && date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const currentSavings = Math.max(0, currentMonthIncome - currentMonthExpenses)
  const savingsRate = currentMonthIncome > 0 ? (currentSavings / currentMonthIncome) * 100 : 0

  // Datos de ejemplo para inversiones
  const [investments, setInvestments] = useState([
    {
      id: "1",
      name: "S&P 500 ETF",
      type: "etf",
      amount: 5000,
      performance: 8.5,
      lastUpdate: "2023-10-15",
    },
    {
      id: "2",
      name: "Tech Growth Fund",
      type: "fund",
      amount: 3000,
      performance: 12.3,
      lastUpdate: "2023-10-15",
    },
    {
      id: "3",
      name: "Dividend Portfolio",
      type: "stock",
      amount: 4500,
      performance: 5.7,
      lastUpdate: "2023-10-15",
    },
  ])

  // Calcular totales
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0)
  const weightedPerformance = investments.reduce((sum, inv) => sum + inv.amount * inv.performance, 0) / totalInvested

  // Añadir nueva inversión
  const addInvestment = () => {
    if (!newInvestmentName.trim()) {
      toast({
        title: "Nombre inválido",
        description: "Por favor ingresa un nombre válido para la inversión",
        variant: "destructive",
      })
      return
    }

    if (!newInvestmentAmount || isNaN(Number(newInvestmentAmount)) || Number(newInvestmentAmount) <= 0) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido para la inversión",
        variant: "destructive",
      })
      return
    }

    const newInvestment = {
      id: Date.now().toString(),
      name: newInvestmentName,
      type: newInvestmentType,
      amount: Number(newInvestmentAmount),
      performance: Math.random() * 10 + 2, // Rendimiento aleatorio entre 2% y 12%
      lastUpdate: new Date().toISOString().split("T")[0],
    }

    setInvestments([...investments, newInvestment])
    setNewInvestmentName("")
    setNewInvestmentAmount("")
    setShowAddInvestmentDialog(false)

    toast({
      title: "Inversión añadida",
      description: "La inversión ha sido añadida exitosamente",
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 text-transparent bg-clip-text">
              Inversiones
            </h2>
          </div>
          <Button onClick={() => setShowAddInvestmentDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Añadir Inversión
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invertido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-muted-foreground">{investments.length} activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rendimiento Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {weightedPerformance.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Rendimiento anual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorros Mensuales</CardTitle>
              <BarChart4 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(currentSavings)}</div>
              <p className="text-xs text-muted-foreground">{savingsRate.toFixed(1)}% de tus ingresos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crecimiento Proyectado</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalInvested * 1.5)}</div>
              <p className="text-xs text-muted-foreground">En 5 años</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-4">
          <TabsList>
            <TabsTrigger value="portfolio">Portafolio</TabsTrigger>
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tus Inversiones</CardTitle>
                <CardDescription>Gestiona tu portafolio de inversiones actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {investments.map((investment) => (
                    <div key={investment.id} className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              investment.type === "etf"
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                                : investment.type === "fund"
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
                                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                            }
                          >
                            {investment.type.toUpperCase()}
                          </Badge>
                          <h3 className="text-sm font-medium">{investment.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Última actualización: {investment.lastUpdate}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(investment.amount)}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">
                          +{investment.performance.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-3">
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowAddInvestmentDialog(true)}>
                  <Plus className="h-4 w-4" />
                  Añadir Inversión
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Activos</CardTitle>
                <CardDescription>Cómo están distribuidas tus inversiones por tipo de activo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "etf", label: "ETFs" },
                    { type: "fund", label: "Fondos" },
                    { type: "stock", label: "Acciones" },
                  ].map((assetType) => {
                    const assetTotal = investments
                      .filter((inv) => inv.type === assetType.type)
                      .reduce((sum, inv) => sum + inv.amount, 0)
                    const percentage = (assetTotal / totalInvested) * 100

                    return (
                      <div key={assetType.type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">{assetType.label}</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(assetTotal)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className="h-2"
                          indicatorClassName={
                            assetType.type === "etf"
                              ? "bg-blue-500"
                              : assetType.type === "fund"
                                ? "bg-purple-500"
                                : "bg-emerald-500"
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento a lo Largo del Tiempo</CardTitle>
                <CardDescription>Seguimiento del rendimiento de tus inversiones</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Gráficos próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones de Inversión</CardTitle>
                <CardDescription>Basadas en tu perfil financiero y objetivos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      name: "ETF de Índice Global",
                      type: "etf",
                      description: "Diversificación global con exposición a mercados desarrollados y emergentes",
                      risk: "low",
                      expectedReturn: "7-9%",
                    },
                    {
                      name: "Aristocratas del Dividendo",
                      type: "stock",
                      description: "Empresas con historial de aumento de dividendos por más de 25 años consecutivos",
                      risk: "medium",
                      expectedReturn: "5-7%",
                    },
                    {
                      name: "Fondo de Energía Verde",
                      type: "fund",
                      description: "Inversión en empresas líderes en energías renovables y tecnologías limpias",
                      risk: "high",
                      expectedReturn: "10-15%",
                    },
                  ].map((recommendation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                recommendation.type === "etf"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                                  : recommendation.type === "fund"
                                    ? "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
                                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                              }
                            >
                              {recommendation.type.toUpperCase()}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                recommendation.risk === "low"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                                  : recommendation.risk === "medium"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                              }
                            >
                              {recommendation.risk === "low"
                                ? "Riesgo Bajo"
                                : recommendation.risk === "medium"
                                  ? "Riesgo Medio"
                                  : "Riesgo Alto"}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-medium">{recommendation.name}</h3>
                          <p className="text-xs text-muted-foreground">{recommendation.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Rendimiento Esperado</div>
                          <div className="font-medium text-emerald-600 dark:text-emerald-400">
                            {recommendation.expectedReturn}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                          Saber más
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 flex justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mr-1" />
                  Las inversiones conllevan riesgos. El rendimiento pasado no garantiza resultados futuros.
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogo para añadir inversión */}
      <Dialog open={showAddInvestmentDialog} onOpenChange={setShowAddInvestmentDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Añadir Inversión</DialogTitle>
            <DialogDescription>Ingresa los detalles de tu nueva inversión</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Inversión</Label>
              <Input
                id="name"
                value={newInvestmentName}
                onChange={(e) => setNewInvestmentName(e.target.value)}
                placeholder="S&P 500 ETF"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Inversión</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newInvestmentType}
                onChange={(e) => setNewInvestmentType(e.target.value)}
              >
                <option value="etf">ETF</option>
                <option value="fund">Fondo</option>
                <option value="stock">Acción</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                value={newInvestmentAmount}
                onChange={(e) => setNewInvestmentAmount(e.target.value)}
                placeholder="1000"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAddInvestmentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={addInvestment}>Añadir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

