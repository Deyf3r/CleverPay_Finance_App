"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Shield, DollarSign, Clock, TrendingDown } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface EmergencyFundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmergencyFundDialog({ open, onOpenChange }: EmergencyFundDialogProps) {
  const { formatCurrency } = useSettings()
  const [months, setMonths] = useState(6)

  // Datos de ejemplo
  const monthlyExpenses = 498.1
  const targetAmount = monthlyExpenses * months
  const currentSavings = 0
  const monthsToComplete = currentSavings > 0 ? Math.ceil((targetAmount - currentSavings) / (monthlyExpenses * 0.2)) : 0

  // Oportunidades de ahorro
  const savingsOpportunities = [
    { category: "Entretenimiento", amount: 74.72, potential: 24.91 },
    { category: "Alimentación", amount: 124.53, potential: 14.94 },
    { category: "Compras", amount: 48.81, potential: 19.92 },
  ]

  const totalPotential = savingsOpportunities.reduce((sum, item) => sum + item.potential, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Fondo de Emergencia
              </DialogTitle>
              <DialogDescription>Protege tu futuro financiero con un colchón para imprevistos</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Gastos Mensuales</h3>
                </div>
                <span className="font-bold text-lg">{formatCurrency(monthlyExpenses)}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Meses a Cubrir</h3>
                  </div>
                  <span className="font-bold text-lg">{months}</span>
                </div>
                <Slider
                  value={[months]}
                  min={3}
                  max={12}
                  step={1}
                  onValueChange={(value) => setMonths(value[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3 meses</span>
                  <span>6 meses</span>
                  <span>12 meses</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-medium">Monto Objetivo</h3>
                </div>
                <span className="font-bold text-lg text-amber-600 dark:text-amber-400">
                  {formatCurrency(targetAmount)}
                </span>
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>
                    {formatCurrency(currentSavings)} / {formatCurrency(targetAmount)}
                  </span>
                </div>
                <Progress value={(currentSavings / targetAmount) * 100} className="h-2" />
              </div>

              <div className="pt-2">
                <Label htmlFor="current-savings">Ahorros Actuales</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">$</span>
                  <Input
                    id="current-savings"
                    value={currentSavings.toString()}
                    onChange={(e) => {
                      // Aquí iría la lógica para actualizar los ahorros actuales
                    }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Label htmlFor="monthly-contribution">Aportación Mensual</Label>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg">$</span>
                  <Input id="monthly-contribution" placeholder="0.00" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                <TrendingDown className="h-4 w-4 text-emerald-600" />
                Oportunidades de Ahorro
              </h3>

              <div className="space-y-4">
                {savingsOpportunities.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{item.category}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2">
                          - {formatCurrency(item.potential)}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(item.potential / item.amount) * 100}
                      className="h-2 bg-slate-100 dark:bg-slate-800"
                      indicatorClassName="bg-emerald-500"
                    />
                  </div>
                ))}

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Ahorro Potencial Mensual</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalPotential)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-medium mb-2">¿Por qué necesitas un fondo de emergencia?</h4>
              <p className="text-sm text-muted-foreground">
                Un fondo de emergencia te protege ante situaciones imprevistas como pérdida de empleo, gastos médicos o
                reparaciones urgentes, evitando que recurras a deudas de alto interés.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)} className="sm:flex-1 bg-amber-600 hover:bg-amber-700">
            Guardar Fondo de Emergencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
