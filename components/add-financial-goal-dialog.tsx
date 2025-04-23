"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, Target } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function AddFinancialGoalDialog() {
  const { user, updateProfile } = useAuth()
  const { formatCurrency } = useSettings()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: "savings",
    target: "",
    current: "",
    deadline: null as Date | null,
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validar datos
    if (!formData.target || Number.parseFloat(formData.target) <= 0) {
      toast({
        title: "Error",
        description: "Por favor ingresa un monto objetivo válido",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Crear nuevo objetivo
    const newGoal = {
      id: Date.now().toString(),
      type: formData.type,
      target: Number.parseFloat(formData.target),
      current: formData.current ? Number.parseFloat(formData.current) : 0,
      deadline: formData.deadline ? formData.deadline.toISOString() : null,
      description: formData.description || "",
    }

    // Actualizar perfil con el nuevo objetivo
    const updatedGoals = [...(user?.financialGoals || []), newGoal]

    updateProfile({
      financialGoals: updatedGoals,
    })

    toast({
      title: "Objetivo financiero creado",
      description: "Tu nuevo objetivo ha sido añadido correctamente",
    })

    // Resetear formulario y cerrar diálogo
    setFormData({
      type: "savings",
      target: "",
      current: "",
      deadline: null,
      description: "",
    })
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90">
          <Target className="mr-2 h-4 w-4" />
          Agregar nuevo objetivo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] dark:border-border/20 elevated-surface">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Nuevo objetivo financiero
            </DialogTitle>
            <DialogDescription>Crea un nuevo objetivo para mejorar tus finanzas</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-type" className="text-right">
                Tipo
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="goal-type" className="col-span-3 dark:bg-muted/10 dark:border-border/30">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Meta de ahorro</SelectItem>
                  <SelectItem value="debt">Pago de deuda</SelectItem>
                  <SelectItem value="investment">Inversión</SelectItem>
                  <SelectItem value="purchase">Compra importante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target-amount" className="text-right">
                Objetivo
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="target-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7 dark:bg-muted/10 dark:border-border/30"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-amount" className="text-right">
                Actual
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="current-amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7 dark:bg-muted/10 dark:border-border/30"
                  value={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">
                Fecha límite
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="deadline"
                    variant={"outline"}
                    className={cn(
                      "col-span-3 justify-start text-left font-normal dark:bg-muted/10 dark:border-border/30",
                      !formData.deadline && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? format(formData.deadline, "PPP") : <span>Selecciona una fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline || undefined}
                    onSelect={(date) => setFormData({ ...formData, deadline: date })}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Input
                id="description"
                placeholder="Describe tu objetivo"
                className="col-span-3 dark:bg-muted/10 dark:border-border/30"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="dark:bg-muted/10 dark:border-border/30"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar objetivo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
