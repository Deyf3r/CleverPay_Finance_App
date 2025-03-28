"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useSettings } from "@/context/settings-context"
import { PiggyBank, Plane, PlusCircle, LightbulbIcon } from "lucide-react"

interface AutomateSavingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AutomateSavingsDialog({ open, onOpenChange }: AutomateSavingsDialogProps) {
  const { translate, formatCurrency } = useSettings()

  // Sample savings goals
  const [savingsGoals, setSavingsGoals] = useState([
    {
      id: "emergency_fund",
      name: "Fondo de Emergencia",
      amount: 4482.93,
      type: "recommended",
      icon: <PiggyBank className="h-5 w-5 text-emerald-500" />,
    },
    {
      id: "vacation_fund",
      name: "Fondo para Vacaciones",
      amount: 2000,
      type: "custom",
      icon: <Plane className="h-5 w-5 text-blue-500" />,
    },
  ])

  // Recommended monthly savings amount
  const recommendedAmount = 250

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            {translate("Automatizar Ahorros")}
          </DialogTitle>
          <DialogDescription>
            {translate("Configura transferencias automáticas para alcanzar tus objetivos de ahorro")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-800 rounded-full">
                <LightbulbIcon className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-300">{translate("Recomendación")}</h3>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                  {translate("Cantidad recomendada")}: {formatCurrency(recommendedAmount)}
                  <span className="text-xs ml-1">({translate("por mes")})</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-lg mb-3">{translate("Objetivos de Ahorro")}</h3>
            <div className="space-y-3">
              {savingsGoals.map((goal) => (
                <div key={goal.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">{goal.icon}</div>
                      <div>
                        <h4 className="font-medium">{goal.name}</h4>
                        <p className="text-sm text-muted-foreground">{formatCurrency(goal.amount)}</p>
                      </div>
                    </div>
                    <Badge
                      variant={goal.type === "recommended" ? "default" : "outline"}
                      className={
                        goal.type === "recommended"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }
                    >
                      {goal.type === "recommended" ? translate("Recomendado") : translate("Personalizado")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{translate("Cantidad mensual a ahorrar")}</label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <Input type="number" defaultValue={recommendedAmount} className="border-blue-200 dark:border-blue-800" />
            </div>
            <p className="text-xs text-muted-foreground">
              {translate("Esta cantidad se transferirá automáticamente a tus cuentas de ahorro cada mes")}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto w-full">
            {translate("Cancelar")}
          </Button>
          <Button
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 sm:w-auto w-full"
            onClick={() => onOpenChange(false)}
          >
            {translate("Agregar Nuevo Objetivo")}
            <PlusCircle className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

