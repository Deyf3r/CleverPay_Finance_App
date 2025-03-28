"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function BudgetPlannerPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()
  const [step, setStep] = useState<"overview" | "detailed">("overview")

  // Sample budget data
  const budgetCategories = [
    { name: "Housing", percentage: 80.3, amount: 1200, suggested: 1080 },
    { name: "Food & Dining", percentage: 10.3, amount: 154.32, suggested: 138.89 },
    { name: "Utilities", percentage: 7.0, amount: 104.99, suggested: 94.49 },
  ]

  const getProgressColor = (category: string) => {
    switch (category) {
      case "Housing":
        return "bg-purple-500"
      case "Food & Dining":
        return "bg-blue-500"
      case "Utilities":
        return "bg-emerald-500"
      default:
        return "bg-primary"
    }
  }

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {translate("Presupuesto Inteligente")}
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          {translate("Ver Dashboard")}
        </Button>
      </div>

      <Card className="border-2 border-purple-100 dark:border-purple-900/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-purple-700 dark:text-purple-400">
            {translate("Crear Presupuesto")}
          </CardTitle>
          <CardDescription>
            {translate("Distribuye tus ingresos de manera inteligente entre las categorías principales")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {budgetCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 rounded-full">
                      {category.name}
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">{category.percentage}%</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(category.amount)}</span>
                </div>
                <Progress value={100} className={`h-2 ${getProgressColor(category.name)}`} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{translate("Sugerido")}:</span>
                  <span>{formatCurrency(category.suggested)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => router.back()}>
            {translate("Cancelar")}
          </Button>
          <Button
            onClick={() => setStep("detailed")}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {translate("Crear Presupuesto Detallado")}
            <PlusCircle className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

