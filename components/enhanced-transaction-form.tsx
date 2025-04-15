"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form"
import * as z from "zod"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TransactionSuccess } from "@/components/transaction-success"
import { Transaction, TransactionType, TransactionCategory, AccountType } from "@/types/finance"

interface TransactionSuccessProps {
  type: TransactionType
  transaction: Transaction
  onClose: () => void
}

interface FormFields {
  title: string
  amount: number
  type: "income" | "expense"
  date: Date
  category: string
  isRecurring: boolean
  importance: number
  description?: string
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "yearly"
  tags?: string[]
}

const formSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  type: z.enum(["income", "expense"] as const),
  date: z.date(),
  category: z.string(),
  isRecurring: z.boolean(),
  importance: z.number().min(1).max(5),
  description: z.string().optional(),
  recurringFrequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
  tags: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof formSchema>

interface FormProps {
  form: UseFormReturn<FormFields>
  onSubmit: SubmitHandler<FormFields>
}

export function EnhancedTransactionForm() {
  const router = useRouter()
  const { addTransaction } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [successData, setSuccessData] = useState<TransactionSuccessProps | null>(null)

  const form = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "expense",
      category: "",
      date: new Date(),
      description: "",
      isRecurring: false,
      importance: 3,
      tags: [],
    },
  })

  const watchType = form.watch("type")
  const watchIsRecurring = form.watch("isRecurring")

  useEffect(() => {
    form.setValue("category", "")
  }, [watchType, form])

  const onSubmit: SubmitHandler<FormFields> = async (values) => {
    try {
      setIsSubmitting(true)

      // Create transaction object
      const transaction = {
        title: values.title,
        amount: parseFloat(values.amount.toString()),
        type: values.type as TransactionType,
        category: values.category as TransactionCategory,
        date: values.date,
        account: "checking" as AccountType,
        isRecurring: values.isRecurring || false,
        importance: values.importance || 3,
        description: values.description || null,
        recurringFrequency: values.recurringFrequency || null,
      }

      // Add tags to the request body separately
      const requestBody = {
        ...transaction,
        tags: currentTags || [],
      }

      // Add the transaction
      const result = await addTransaction(requestBody)

      setSuccessData({
        type: transaction.type,
        transaction: result,
        onClose: () => setShowSuccess(false)
      })
      setShowSuccess(true)

      // Reset form
      form.reset()
      setCurrentTags([])

      // Redirect after a delay
      setTimeout(() => {
        router.push("/transactions")
      }, 2000)
    } catch (error) {
      console.error("Error adding transaction:", error)
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      setCurrentTags([...currentTags, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setCurrentTags(currentTags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (showSuccess && successData) {
    return (
      <TransactionSuccess
        type={successData.type}
        transaction={successData.transaction}
        onClose={successData.onClose}
      />
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Transacción</CardTitle>
        <CardDescription>Registra una nueva transacción en tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa un título" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Ingreso</SelectItem>
                        <SelectItem value="expense">Gasto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories[watchType].map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                              <span>Selecciona una fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>¿Es recurrente?</FormLabel>
                      <FormDescription>
                        Marca esta opción si esta transacción se repite periódicamente
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {watchIsRecurring && (
                <FormField
                  control={form.control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frecuencia</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la frecuencia" />
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

              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importancia</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                        <span>{field.value}</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      1 = Baja, 5 = Alta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Agrega una descripción (opcional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Etiquetas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <XIcon
                        className="h-3 w-3 cursor-pointer"
                        onClick={() =>
                          setCurrentTags((prev) =>
                            prev.filter((prevTag) => prevTag !== tag)
                          )
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Nueva etiqueta"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTag.trim()) {
                      e.preventDefault()
                      if (!currentTags.includes(newTag.trim())) {
                        setCurrentTags((prev) => [...prev, newTag.trim()])
                      }
                      setNewTag("")
                    }
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => {
                    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
                      setCurrentTags((prev) => [...prev, newTag.trim()])
                    }
                    setNewTag("")
                  }}
                  disabled={!newTag.trim()}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

const categories = {
  income: [
    "Salario",
    "Inversiones",
    "Regalos",
    "Bonos",
    "Freelance",
    "Alquileres",
    "Dividendos",
    "Reembolsos",
    "Ventas",
    "Otros",
  ],
  expense: [
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Entretenimiento",
    "Salud",
    "Educación",
    "Ropa",
    "Servicios",
    "Viajes",
    "Tecnología",
    "Mascotas",
    "Regalos",
    "Impuestos",
    "Seguros",
    "Otros",
  ],
}
