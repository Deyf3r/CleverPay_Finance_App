"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Lightbulb, ArrowDown, BadgeDollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useSettings } from "@/context/settings-context"

interface DebtReductionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DebtReductionDialog({ open, onOpenChange }: DebtReductionDialogProps) {
  const { formatCurrency } = useSettings()

  // Datos de ejemplo
  const debts = [
    { id: "1", name: "Tarjeta de Crédito", amount: 1500, interest: 18, priority: "high" },
    { id: "2", name: "Préstamo Personal", amount: 5000, interest: 8, priority: "medium" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
              <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Estrategia de Reducción de Deuda
              </DialogTitle>
              <DialogDescription>Plan personalizado para liberarte de deudas más rápido</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-lg border border-rose-100 dark:border-rose-900/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 mt-1">
                <Lightbulb className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Recomendación de Estrategia</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Método de la Bola de Nieve: Paga primero las deudas más pequeñas para ganar impulso psicológico.
                </p>
                <Badge
                  variant="outline"
                  className="bg-rose-100/50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                >
                  Recomendado para ti
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4">Tus Deudas</h3>

            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full 
                        ${
                          debt.priority === "high"
                            ? "bg-rose-100 dark:bg-rose-900/30"
                            : "bg-amber-100 dark:bg-amber-900/30"
                        }`}
                      >
                        <CreditCard
                          className={`h-4 w-4 
                          ${
                            debt.priority === "high"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{debt.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(debt.amount)} - {debt.interest}% de interés
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          debt.priority === "high"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                        }`}
                    >
                      {debt.priority === "high" ? "Alta Prioridad" : "Prioridad Media"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <BadgeDollarSign className="h-4 w-4 text-slate-600" />
              Pasos para Reducir tu Deuda
            </h3>

            <ol className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                  1
                </div>
                <div>
                  <strong>Prioriza tus deudas</strong>: Enfócate primero en la tarjeta de crédito con 18% de interés.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                  2
                </div>
                <div>
                  <strong>Pago mínimo en todas</strong>: Realiza el pago mínimo en todas tus deudas para evitar cargos
                  por mora.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                  3
                </div>
                <div>
                  <strong>Pagos extra a la deuda prioritaria</strong>: Destina cualquier dinero adicional a la deuda con
                  mayor interés.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-medium">
                  4
                </div>
                <div>
                  <strong>Avanza a la siguiente</strong>: Una vez pagada la primera deuda, dirige ese pago a la
                  siguiente.
                </div>
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:flex-1">
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)} className="sm:flex-1 gap-2 bg-rose-600 hover:bg-rose-700">
            <ArrowDown className="h-4 w-4" />
            Crear Estrategia de Deuda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

