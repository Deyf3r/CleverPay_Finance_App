"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Wallet, TrendingDown, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export default function DebtPlannerPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()

  // Sample debt data
  const debts = [
    {
      type: "credit_card",
      name: "Tarjeta de Crédito",
      balance: 1500,
      interestRate: 18,
      priority: "high",
      icon: <CreditCard className="h-5 w-5 text-rose-500" />,
    },
    {
      type: "personal_loan",
      name: "Préstamo Personal",
      balance: 5000,
      interestRate: 8,
      priority: "medium",
      icon: <Wallet className="h-5 w-5 text-blue-500" />,
    },
  ]

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {translate("Estrategia de Reducción de Deuda")}
          </h1>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")} className="gap-2">
          <TrendingDown className="h-4 w-4" />
          {translate("Ver Dashboard")}
        </Button>
      </div>

      <Card className="border-2 border-rose-100 dark:border-rose-900/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-rose-700 dark:text-rose-400">
            {translate("Estrategia de Reducción de Deuda")}
          </CardTitle>
          <CardDescription>
            {translate("Plan personalizado para eliminar tus deudas de manera eficiente")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-800 rounded-full">
                  <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-rose-700 dark:text-rose-300">
                    {translate("Recomendación de Estrategia")}
                  </h3>
                  <p className="text-sm text-rose-600/80 dark:text-rose-400/80">
                    {translate("Método de Bola de Nieve: Paga primero las deudas con mayor interés")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-medium text-lg mb-3">{translate("Tus Deudas")}</h3>
            <div className="space-y-3">
              {debts.map((debt) => (
                <Card key={debt.type} className="border-slate-200 dark:border-slate-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">{debt.icon}</div>
                        <div>
                          <h4 className="font-medium">{debt.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(debt.balance)} - {debt.interestRate}% {translate("interés")}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={debt.priority === "high" ? "destructive" : "outline"}
                        className={
                          debt.priority === "high"
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }
                      >
                        {debt.priority === "high" ? translate("Alta Prioridad") : translate("Prioridad Media")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => router.back()}>
            {translate("Cancelar")}
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700">
            {translate("Crear Estrategia de Pago")}
            <PlusCircle className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <Button onClick={() => router.push("/dashboard")} variant="outline" className="mx-auto block">
        {translate("Volver al Dashboard")}
      </Button>
    </motion.div>
  )
}

