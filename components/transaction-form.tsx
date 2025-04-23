"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { AccountType, Transaction } from "@/types"
import { AccountSelector, getAccountIcon } from "@/components/transaction-form/account-selector"
import { SmartSuggestions } from "@/components/transaction-form/smart-suggestions"

// Iconos para categorías
import {
  Utensils,
  ShoppingBag,
  Home,
  Car,
  Heart,
  Briefcase,
  Plane,
  BookOpen,
  Gift,
  DollarSign,
} from "lucide-react"

// Esquema de validación
const formSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  date: z.date(),
  category: z.string(),
  type: z.enum(["ingreso", "gasto", "transferencia"] as const),
  account: z.enum(["checking", "savings", "credit", "cash"] as const),
  isRecurring: z.boolean().default(false),
  notes: z.string().optional(),
  recurringFrequency: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Tipo derivado del esquema
type FormValues = z.infer<typeof formSchema>

// Categorías con iconos
const categories = [
  { value: "comida", label: "Comida y Restaurantes", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "compras", label: "Compras", icon: <ShoppingBag className="mr-2 h-4 w-4" /> },
  { value: "hogar", label: "Hogar", icon: <Home className="mr-2 h-4 w-4" /> },
  { value: "transporte", label: "Transporte", icon: <Car className="mr-2 h-4 w-4" /> },
  { value: "salud", label: "Salud", icon: <Heart className="mr-2 h-4 w-4" /> },
  { value: "trabajo", label: "Trabajo", icon: <Briefcase className="mr-2 h-4 w-4" /> },
  { value: "viajes", label: "Viajes", icon: <Plane className="mr-2 h-4 w-4" /> },
  { value: "educacion", label: "Educación", icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { value: "regalos", label: "Regalos", icon: <Gift className="mr-2 h-4 w-4" /> },
  { value: "ingresos", label: "Ingresos", icon: <DollarSign className="mr-2 h-4 w-4" /> },
]

// Etiquetas predefinidas
const predefinedTags = [
  "Esencial",
  "Discrecional",
  "Ahorro",
  "Inversión",
  "Emergencia",
  "Vacaciones",
  "Familia",
  "Trabajo",
  "Personal",
  "Educación",
  "Entretenimiento",
  "Subscripción",
]

// Componente principal del formulario
function TransactionForm({ transactionId }: { transactionId?: string }) {
  const router = useRouter()
  const { addTransaction, editTransaction, getTransactionById, state } = useFinance()
  const { formatCurrency } = useSettings()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  // Configuración del formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      date: new Date(),
      category: "",
      type: "gasto",
      account: "checking",
      isRecurring: false,
      notes: "",
      recurringFrequency: "",
      tags: [],
    },
  })

  // Cargar datos de la transacción si se está editando
  useEffect(() => {
    if (transactionId) {
      const existingTransaction = getTransactionById(transactionId)
      if (existingTransaction) {
        setTransaction(existingTransaction)
        form.reset({
          description: existingTransaction.description,
          amount: existingTransaction.amount,
          date: new Date(existingTransaction.date),
          category: existingTransaction.category,
          type: existingTransaction.type as "ingreso" | "gasto" | "transferencia",
          account: existingTransaction.account,
          isRecurring: existingTransaction.isRecurring || false,
          notes: existingTransaction.notes || "",
          recurringFrequency: existingTransaction.recurringFrequency || "",
          tags: existingTransaction.tags || [],
        })
        if (existingTransaction.tags) {
          setSelectedTags(existingTransaction.tags)
        }
      }
    }
  }, [transactionId, getTransactionById, form])

  // Manejar envío del formulario
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      // Incluir etiquetas seleccionadas
      const transactionData = {
        ...values,
        tags: selectedTags,
      }

      if (transactionId && transaction) {
        // Editar transacción existente
        await editTransaction({
          ...transaction,
          ...transactionData,
        })
      } else {
        // Crear nueva transacción
        await addTransaction(transactionData as unknown as Omit<Transaction, "id">)
      }

      // Redireccionar después de guardar
      router.push("/dashboard")
    } catch (error) {
      console.error("Error al guardar la transacción:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar sugerencias de categorías
  const handleCategorySuggestion = (suggestion: string) => {
    form.setValue("category", suggestion)
  }

  // Manejar sugerencias inteligentes
  const handleSuggestionSelect = (suggestion: { description: string; amount: number; category: string }) => {
    form.setValue("description", suggestion.description)
    form.setValue("amount", suggestion.amount)
    form.setValue("category", suggestion.category)
  }

  // Manejar adición de etiquetas
  const handleAddTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
      setNewTag("")
    }
  }

  // Manejar eliminación de etiquetas
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  // Preparar cuentas para el selector
  const systemAccounts = Object.entries(state.accounts).map(([key, account]) => ({
    value: key,
    label: account.name,
    balance: account.balance,
    icon: getAccountIcon(key as AccountType)
  }))

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>{transactionId ? "Editar Transacción" : "Nueva Transacción"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de transacción */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Transacción</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ingreso" />
                          </FormControl>
                          <FormLabel className="font-normal">Ingreso</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="gasto" />
                          </FormControl>
                          <FormLabel className="font-normal">Gasto</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="transferencia" />
                          </FormControl>
                          <FormLabel className="font-normal">Transferencia</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sugerencias inteligentes */}
              <SmartSuggestions onSelect={handleSuggestionSelect} type={form.watch("type")} />

              {/* Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Compra de supermercado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Monto */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoría */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Input placeholder="Ej: Alimentación" {...field} />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySuggestion("Alimentación")}
                          >
                            Alimentación
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySuggestion("Transporte")}
                          >
                            Transporte
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySuggestion("Ocio")}
                          >
                            Ocio
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySuggestion("Salud")}
                          >
                            Salud
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCategorySuggestion("Hogar")}
                          >
                            Hogar
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cuenta */}
              <FormField
                control={form.control}
                name="account"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuenta</FormLabel>
                    <FormControl>
                      <AccountSelector 
                        value={field.value} 
                        onChange={field.onChange} 
                        accounts={systemAccounts}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Transacción recurrente */}
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Transacción Recurrente</FormLabel>
                      <FormDescription>
                        Marcar si esta transacción se repite regularmente
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Frecuencia de recurrencia (condicional) */}
              {form.watch("isRecurring") && (
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar frecuencia" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Notas */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Añade detalles adicionales sobre esta transacción..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Etiquetas */}
              <div className="space-y-2">
                <FormLabel>Etiquetas</FormLabel>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Añadir etiqueta"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!newTag}
                  >
                    Añadir
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : transactionId ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransactionForm
