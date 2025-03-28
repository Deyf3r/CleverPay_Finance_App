"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Wallet, PiggyBank, TrendingDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export default function EmergencyFundPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()

  // Sample data
  const [monthlyExpenses, setMonthlyExpenses] = useState(498.1)
  const [monthsToSave, setMonthsToSave] = useState(6)
  const [currentSavings, setCurrentSavings] = useState(0)
  const [monthlyContribution, setMonthlyContribution] = useState(0)

  const targetAmount = monthlyExpenses * monthsToSave
  const progress = currentSavings > 0 ? (currentSavings / targetAmount) * 100 : 0
  const completionTime = monthlyContribution > 0 ? Math.ceil((targetAmount - currentSavings) / monthlyContribution) : 0

  // Savings opportunities
  const savingsOpportunities = [
    { category: "Entretenimiento", amount: 74.72, potential: 24.91 },
    { category: "Comida y Restaurantes", amount: 124.53, potential: 14.94 },
    { category: "Compras", amount: 49.81, potential: 19.92 },
  ]

  const totalPotentialSavings = savingsOpportunities.reduce((sum, item) => sum + item.potential, 0)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
            {translate("Fondo de Emergencia")}
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
          <Wallet className="h-4 w-4" />
          {translate("Ver Dashboard")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{translate("Gastos Mensuales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">{translate("Promedio de gastos")}</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{translate("Objetivo Total")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(targetAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {monthsToSave} {translate("meses de gastos")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{translate("Ahorros Actuales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentSavings)}</div>
            <p className="text-xs text-muted-foreground">
              {((progress / 100) * monthsToSave).toFixed(1)} {translate("meses cubiertos")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {translate("Tiempo de Finalización")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completionTime} {translate("meses")}
            </div>
            <p className="text-xs text-muted-foreground">
              {translate("a")} {formatCurrency(monthlyContribution)} {translate("por mes")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-amber-500" />
              <CardTitle>{translate("Configuración del Fondo")}</CardTitle>
            </div>
            <CardDescription>{translate("Personaliza tu fondo de emergencia según tus necesidades")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">
                  {translate("Meses a cubrir")}: {monthsToSave}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setMonthsToSave(3)}
                  >
                    3
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-6 w-6 p-0 rounded-full ${monthsToSave === 6 ? "bg-amber-500 text-white" : ""}`}
                    onClick={() => setMonthsToSave(6)}
                  >
                    6
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full"
                    onClick={() => setMonthsToSave(12)}
                  >
                    12
                  </Button>
                </div>
              </div>
              <Slider
                value={[monthsToSave]}
                min={3}
                max={12}
                step={1}
                onValueChange={(value) => setMonthsToSave(value[0])}
                className="[&>span]:bg-amber-500"
              />
              <p className="text-xs text-muted-foreground">
                {translate("Se recomienda tener entre 3-6 meses de gastos guardados")}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{translate("Ahorros actuales")}</label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <Input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number.parseFloat(e.target.value) || 0)}
                  className="border-amber-200 dark:border-amber-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{translate("Contribución mensual")}</label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <Input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number.parseFloat(e.target.value) || 0)}
                  className="border-amber-200 dark:border-amber-800"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{translate("Progreso")}</span>
                <span>
                  {formatCurrency(currentSavings)} / {formatCurrency(targetAmount)}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-amber-100 [&>div]:bg-amber-500" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              onClick={() => {}}
            >
              {translate("Guardar Configuración")}
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-amber-100 dark:border-amber-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-500" />
              <CardTitle>{translate("Oportunidades de Ahorro")}</CardTitle>
            </div>
            <CardDescription>{translate("Áreas donde puedes reducir gastos para ahorrar más rápido")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {savingsOpportunities.map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex justify-between">
                  <span>{item.category}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
                <Progress value={100} className="h-2 bg-green-100 [&>div]:bg-green-500" />
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {translate("Ahorro potencial")}:
                  </span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    - {formatCurrency(item.potential)}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-medium">{translate("Ahorro mensual potencial")}</span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPotentialSavings)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {translate("Ahorro anual potencial")}: {formatCurrency(totalPotentialSavings * 12)}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/budget-planner")}>
              {translate("Optimizar Presupuesto")}
            </Button>
            <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => {}}>
              {translate("Actualizar Mensualmente")}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Button onClick={() => router.push("/dashboard")} variant="outline" className="mx-auto block">
        {translate("Volver al Dashboard")}
      </Button>
    </motion.div>
  )
}

