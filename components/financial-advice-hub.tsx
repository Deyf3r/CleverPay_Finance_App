"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PieChart, TrendingUp, Shield, BadgeDollarSign, CreditCard } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import BudgetDialog from "@/components/budget-dialog"
import EmergencyFundDialog from "@/components/emergency-fund-dialog"
import DebtReductionDialog from "@/components/debt-reduction-dialog"
import AutomateSavingsDialog from "@/components/automate-savings-dialog"

export function FinancialAdviceHub() {
  const router = useRouter()
  const { translate } = useSettings()
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [emergencyFundDialogOpen, setEmergencyFundDialogOpen] = useState(false)
  const [debtReductionDialogOpen, setDebtReductionDialogOpen] = useState(false)
  const [automateSavingsOpen, setAutomateSavingsOpen] = useState(false)

  return (
    <>
      <h3 className="text-lg font-medium mb-4">Consejos Financieros</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden border-indigo-100 dark:border-indigo-900/30 hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                  <PieChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Diversifica tus Gastos</h3>
                  <p className="text-sm text-muted-foreground">Estás gastando demasiado en una sola categoría</p>
                </div>
              </div>
              <p className="text-sm">
                El 80% de tus gastos están en vivienda. Considera redistribuir tu presupuesto para tener más
                flexibilidad financiera.
              </p>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 border-t border-indigo-100 dark:border-indigo-900/30">
              <Button variant="outline" className="w-full" onClick={() => setBudgetDialogOpen(true)}>
                Crear Presupuesto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-green-100 dark:border-green-900/30 hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Oportunidades de Inversión</h3>
                  <p className="text-sm text-muted-foreground">Tienes fondos que podrían generar rendimientos</p>
                </div>
              </div>
              <p className="text-sm">
                Con tus ahorros actuales, podrías considerar inversiones de bajo riesgo que generen mejores rendimientos
                que una cuenta de ahorros tradicional.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 border-t border-green-100 dark:border-green-900/30">
              <Button variant="outline" className="w-full" onClick={() => router.push("/investments")}>
                Explorar Inversiones
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Fondo de Emergencia</h3>
                  <p className="text-sm text-muted-foreground">No tienes un fondo para imprevistos</p>
                </div>
              </div>
              <p className="text-sm">
                Se recomienda tener al menos 3-6 meses de gastos guardados para emergencias. Actualmente no tienes
                ahorros para este propósito.
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 border-t border-amber-100 dark:border-amber-900/30">
              <Button variant="outline" className="w-full" onClick={() => setEmergencyFundDialogOpen(true)}>
                Crear Fondo de Emergencia
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <BadgeDollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Automatiza tus Ahorros</h3>
                  <p className="text-sm text-muted-foreground">Configura transferencias automáticas</p>
                </div>
              </div>
              <p className="text-sm">
                Automatizar tus ahorros te ayudará a alcanzar tus metas financieras más rápido. Configura transferencias
                automáticas a tus cuentas de ahorro.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 border-t border-blue-100 dark:border-blue-900/30">
              <Button variant="outline" className="w-full" onClick={() => setAutomateSavingsOpen(true)}>
                Configurar Ahorros Automáticos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-rose-100 dark:border-rose-900/30 hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-full">
                  <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Reduce tu Deuda</h3>
                  <p className="text-sm text-muted-foreground">Prioriza pagar deudas de alto interés</p>
                </div>
              </div>
              <p className="text-sm">
                Tu tarjeta de crédito tiene un interés del 18%. Prioriza pagar esta deuda antes que otras con menor
                interés para ahorrar dinero a largo plazo.
              </p>
            </div>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-4 border-t border-rose-100 dark:border-rose-900/30">
              <Button variant="outline" className="w-full" onClick={() => setDebtReductionDialogOpen(true)}>
                Crear Plan de Reducción de Deuda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BudgetDialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen} />
      <EmergencyFundDialog open={emergencyFundDialogOpen} onOpenChange={setEmergencyFundDialogOpen} />
      <DebtReductionDialog open={debtReductionDialogOpen} onOpenChange={setDebtReductionDialogOpen} />
      <AutomateSavingsDialog open={automateSavingsOpen} onOpenChange={setAutomateSavingsOpen} />
    </>
  )
}

