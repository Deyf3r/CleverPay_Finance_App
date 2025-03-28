"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useFinance } from "@/context/finance-context"

const formSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "El título debe tener al menos 2 caracteres.",
    })
    .max(50, {
      message: "El título no puede exceder los 50 caracteres.",
    }),
  amount: z.coerce.number().min(0.01, {
    message: "El monto debe ser mayor que 0.",
  }),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, {
    message: "Por favor selecciona una categoría.",
  }),
  date: z.date({
    required_error: "Por favor selecciona una fecha.",
  }),
  description: z
    .string()
    .max(200, {
      message: "La descripción no puede exceder los 200 caracteres.",
    })
    .optional(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
  importance: z.number().min(1).max(5).default(3),
  tags: z.array(z.string()).optional(),
})

export function EnhancedTransactionForm() {
  const router = useRouter()
  const { addTransaction } = useFinance()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [successData, setSuccessData] = useState<any>(null)
  
  const categories = {
    income: [
      'Salario', 'Inversiones', 'Regalos', 'Bonos', 'Freelance', 
      'Alquileres', 'Dividendos', 'Reembolsos', 'Ventas', 'Otros'
    ],
    expense: [
      'Alimentación', 'Transporte', 'Vivienda', 'Entretenimiento', 'Salud', 
      'Educación', 'Ropa', 'Servicios', 'Viajes', 'Tecnología', 'Mascotas', 
      'Regalos', 'Impuestos', 'Seguros', 'Otros'
    ]
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: undefined,
      type: 'expense',
      category: '',
      date: new Date(),
      description: '',
      isRecurring: false,
      importance: 3,
      tags: [],
    },
  })

  const watchType = form.watch('type')
  const watchIsRecurring = form.watch('isRecurring')
  
  useEffect(() => {
    // Reset category when type changes
    form.setValue('category', '')
  }, [watchType, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      // Add tags to the form values
      values.tags = currentTags
      
      // Create transaction object
      const transaction = {
        id: Date.now().toString(),
        ...values,
        createdAt: new Date().toISOString(),
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

