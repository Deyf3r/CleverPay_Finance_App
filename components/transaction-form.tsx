"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TrendingUp } from "lucide-react"

// Iconos para categorías
import {
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Briefcase,
  HeartPulse,
  Plane,
  Smartphone,
  GraduationCap,
  DollarSign,
  CreditCard,
  Film,
  Zap,
  PiggyBank,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"

// Esquema de validación
const formSchema = z.object({
  description: z.string().min(2, {
    message: "La descripción debe tener al menos 2 caracteres.",
  }),
  amount: z.coerce.number().positive({
    message: "El monto debe ser un número positivo.",
  }),
  date: z.date({
    required_error: "Por favor selecciona una fecha.",
  }),
  category: z.string({
    required_error: "Por favor selecciona una categoría.",
  }),
  type: z.enum(["ingreso", "gasto", "transferencia"], {
    required_error: "Por favor selecciona un tipo de transacción.",
  }),
  account: z.string({
    required_error: "Por favor selecciona una cuenta.",
  }),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Categorías con iconos
const categories = [
  { value: "comida", label: "Comida y Restaurantes", icon: <Utensils className="mr-2 h-4 w-4" /> },
  { value: "transporte", label: "Transporte", icon: <Car className="mr-2 h-4 w-4" /> },
  { value: "hogar", label: "Hogar", icon: <Home className="mr-2 h-4 w-4" /> },
  { value: "compras", label: "Compras", icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
  { value: "salud", label: "Salud", icon: <HeartPulse className="mr-2 h-4 w-4" /> },
  { value: "viajes", label: "Viajes", icon: <Plane className="mr-2 h-4 w-4" /> },
  { value: "tecnologia", label: "Tecnología", icon: <Smartphone className="mr-2 h-4 w-4" /> },
  { value: "educacion", label: "Educación", icon: <GraduationCap className="mr-2 h-4 w-4" /> },
  { value: "entretenimiento", label: "Entretenimiento", icon: <Film className="mr-2 h-4 w-4" /> },
  { value: "servicios", label: "Servicios", icon: <Zap className="mr-2 h-4 w-4" /> },
  { value: "sueldo", label: "Sueldo", icon: <Briefcase className="mr-2 h-4 w-4" /> },
  { value: "inversiones", label: "Inversiones", icon: <TrendingUp className="mr-2 h-4 w-4" /> },
  { value: "otros", label: "Otros", icon: <DollarSign className="mr-2 h-4 w-4" /> },
]

// Cuentas de ejemplo
const accounts = [
  {
    value: "cuenta-corriente",
    label: "Cuenta Corriente",
    balance: 2500.75,
    icon: <CreditCard className="mr-2 h-4 w-4" />,
  },
  {
    value: "cuenta-ahorros",
    label: "Cuenta de Ahorros",
    balance: 15000.5,
    icon: <PiggyBank className="mr-2 h-4 w-4" />,
  },
  {
    value: "tarjeta-credito",
    label: "Tarjeta de Crédito",
    balance: -450.25,
    icon: <CreditCard className="mr-2 h-4 w-4" />,
  },
  { value: "efectivo", label: "Efectivo", balance: 300.0, icon: <DollarSign className="mr-2 h-4 w-4" /> },
  {
    value: "inversiones",
    label: "Cuenta de Inversiones",
    balance: 8750.0,
    icon: <Landmark className="mr-2 h-4 w-4" />,
  },
]

// Tags predefinidos
const predefinedTags = [
  "Esencial",
  "Lujo",
  "Trabajo",
  "Personal",
  "Familia",
  "Vacaciones",
  "Proyecto",
  "Subscripción",
  "Impuestos",
  "Regalo",
]

// Componente para sugerencias inteligentes
const SmartSuggestions = ({ onSelect, type }) => {
  const suggestions =
    type === "ingreso"
      ? [
          { description: "Sueldo mensual", amount: 2500, category: "sueldo" },
          { description: "Dividendos", amount: 150, category: "inversiones" },
          { description: "Freelance", amount: 400, category: "sueldo" },
        ]
      : [
          { description: "Supermercado", amount: 85.5, category: "comida" },
          { description: "Gasolina", amount: 45.0, category: "transporte" },
          { description: "Netflix", amount: 12.99, category: "entretenimiento" },
          { description: "Restaurante", amount: 35.0, category: "comida" },
        ]

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Sugerencias rápidas</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-accent flex items-center gap-1 py-1.5 px-3"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion.description}
              <span className="font-bold ml-1">${suggestion.amount}</span>
            </Badge>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Componente para el selector de cuenta con balance
const AccountSelector = ({ accounts, value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {value ? accounts.find((account) => account.value === value)?.label : "Selecciona una cuenta"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar cuenta..." />
          <CommandList>
            <CommandEmpty>No se encontraron cuentas.</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.value}
                  value={account.value}
                  onSelect={() => onChange(account.value)}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center">
                    {account.icon}
                    {account.label}
                  </div>
                  <Badge variant={account.balance >= 0 ? "outline" : "destructive"} className="ml-2">
                    ${account.balance.toFixed(2)}
                  </Badge>
                  {value === account.value && <Check className="ml-auto h-4 w-4" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Componente principal del formulario
export default function TransactionForm() {
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("basico")
  const [previewData, setPreviewData] = useState(null)

  // Inicializar el formulario
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      date: new Date(),
      category: "",
      type: "gasto",
      account: "",
      notes: "",
      isRecurring: false,
      recurringFrequency: "mensual",
      tags: [],
    },
  })

  // Observar cambios en el tipo de transacción
  const transactionType = form.watch("type")

  // Manejar envío del formulario
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Agregar tags al objeto de valores
      values.tags = selectedTags

      // Simular envío a API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mostrar notificación de éxito
      toast({
        title: "¡Transacción añadida con éxito!",
        description: (
          <div className="flex items-center gap-2">
            <span>{values.description}</span>
            <Badge variant={values.type === "ingreso" ? "success" : "destructive"}>
              {values.type === "ingreso" ? "+" : "-"}${values.amount}
            </Badge>
          </div>
        ),
      })

      // Redireccionar a la página de transacciones
      router.push("/transactions")
      router.refresh()
    } catch (error) {
      console.error("Error al añadir transacción:", error)
      toast({
        title: "Error al añadir la transacción",
        description: "Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar selección de sugerencia
  const handleSuggestionSelect = (suggestion) => {
    form.setValue("description", suggestion.description)
    form.setValue("amount", suggestion.amount)
    form.setValue("category", suggestion.category)
  }

  // Manejar adición de tag
  const handleAddTag = () => {
    if (newTag && !selectedTags.includes(newTag)) {
      setSelectedTags([...selectedTags, newTag])
      setNewTag("")
    }
  }

  // Manejar eliminación de tag
  const handleRemoveTag = (tag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag))
  }

  // Generar vista previa
  const generatePreview = () => {
    const values = form.getValues()
    setPreviewData({
      ...values,
      tags: selectedTags,
      date: format(values.date, "PPP", { locale: es }),
      categoryLabel: categories.find((c) => c.value === values.category)?.label || values.category,
      accountLabel: accounts.find((a) => a.value === values.account)?.label || values.account,
    })
  }

  // Efecto para actualizar la vista previa cuando cambian los valores
  useEffect(() => {
    const subscription = form.watch(() => {
      if (activeTab === "vista-previa") {
        generatePreview()
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, activeTab, selectedTags])

  // Efecto para generar la vista previa al cambiar a esa pestaña
  useEffect(() => {
    if (activeTab === "vista-previa") {
      generatePreview()
    }
  }, [activeTab])

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="basico">Información Básica</TabsTrigger>
          <TabsTrigger value="avanzado">Opciones Avanzadas</TabsTrigger>
          <TabsTrigger value="vista-previa">Vista Previa</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="basico" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Detalles de la Transacción</CardTitle>
                    <CardDescription>Ingresa la información básica de tu transacción</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tipo de transacción */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Transacción</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              type="button"
                              variant={field.value === "ingreso" ? "default" : "outline"}
                              className={cn(
                                "flex items-center gap-2",
                                field.value === "ingreso" && "bg-green-600 hover:bg-green-700",
                              )}
                              onClick={() => field.onChange("ingreso")}
                            >
                              <ArrowDownLeft className="h-4 w-4" />
                              Ingreso
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "gasto" ? "default" : "outline"}
                              className={cn(
                                "flex items-center gap-2",
                                field.value === "gasto" && "bg-red-600 hover:bg-red-700",
                              )}
                              onClick={() => field.onChange("gasto")}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                              Gasto
                            </Button>
                            <Button
                              type="button"
                              variant={field.value === "transferencia" ? "default" : "outline"}
                              className={cn(
                                "flex items-center gap-2",
                                field.value === "transferencia" && "bg-blue-600 hover:bg-blue-700",
                              )}
                              onClick={() => field.onChange("transferencia")}
                            >
                              <ArrowUpRight className="h-4 w-4" />
                              Transferencia
                            </Button>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Descripción */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Compra en supermercado" {...field} />
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
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                            </div>
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
                                    !field.value && "text-muted-foreground",
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
                                initialFocus
                                locale={es}
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
                        <FormItem className="flex flex-col">
                          <FormLabel>Categoría</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? (
                                    <div className="flex items-center">
                                      {categories.find((category) => category.value === field.value)?.icon}
                                      {categories.find((category) => category.value === field.value)?.label}
                                    </div>
                                  ) : (
                                    "Selecciona una categoría"
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar categoría..." />
                                <CommandList>
                                  <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                                  <CommandGroup>
                                    {categories.map((category) => (
                                      <CommandItem
                                        key={category.value}
                                        value={category.value}
                                        onSelect={() => {
                                          form.setValue("category", category.value)
                                        }}
                                        className="flex items-center"
                                      >
                                        {category.icon}
                                        {category.label}
                                        {field.value === category.value && <Check className="ml-auto h-4 w-4" />}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                            <AccountSelector accounts={accounts} value={field.value} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Sugerencias inteligentes */}
                    <SmartSuggestions onSelect={handleSuggestionSelect} type={transactionType} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="avanzado" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Opciones Avanzadas</CardTitle>
                    <CardDescription>Configura opciones adicionales para tu transacción</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Notas */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Añade notas o detalles adicionales sobre esta transacción"
                              className="resize-none"
                              {...field}
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
                            <FormDescription>Marca si esta transacción se repite regularmente</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Frecuencia de recurrencia */}
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
                                  <SelectValue placeholder="Selecciona la frecuencia" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="diaria">Diaria</SelectItem>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="quincenal">Quincenal</SelectItem>
                                <SelectItem value="mensual">Mensual</SelectItem>
                                <SelectItem value="trimestral">Trimestral</SelectItem>
                                <SelectItem value="anual">Anual</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {/* Etiquetas */}
                    <div className="space-y-2">
                      <FormLabel>Etiquetas</FormLabel>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1.5">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Nueva etiqueta"
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddTag()
                            }
                          }}
                        />
                        <Button type="button" size="icon" onClick={handleAddTag} disabled={!newTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Etiquetas sugeridas:</p>
                        <ScrollArea className="h-20 w-full rounded-md border">
                          <div className="flex flex-wrap gap-1 p-2">
                            {predefinedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => {
                                  if (!selectedTags.includes(tag)) {
                                    setSelectedTags([...selectedTags, tag])
                                  }
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="vista-previa">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {previewData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Vista Previa de la Transacción</CardTitle>
                      <CardDescription>Revisa los detalles antes de guardar</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">{previewData.description}</h3>
                          <Badge
                            variant={
                              previewData.type === "ingreso"
                                ? "success"
                                : previewData.type === "gasto"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="text-lg py-1.5"
                          >
                            {previewData.type === "ingreso" ? "+" : "-"}${previewData.amount}
                          </Badge>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Fecha</p>
                            <p className="font-medium">{previewData.date}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Categoría</p>
                            <p className="font-medium">{previewData.categoryLabel}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Cuenta</p>
                            <p className="font-medium">{previewData.accountLabel}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Tipo</p>
                            <p className="font-medium capitalize">{previewData.type}</p>
                          </div>
                        </div>

                        {previewData.isRecurring && (
                          <div>
                            <p className="text-sm text-muted-foreground">Recurrencia</p>
                            <p className="font-medium capitalize">{previewData.recurringFrequency}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <h2 className="text-xl font-semibold mb-4">No hay vista previa disponible</h2>
                    <p className="text-muted-foreground">
                      Completa los campos en las pestañas anteriores para generar una vista previa.
                    </p>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <motion.div
              className="flex justify-end space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                Guardar Transacción
              </Button>
            </motion.div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
