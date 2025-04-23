"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionType } from "@/types"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { useState, useEffect } from "react"

// Interfaz para las propiedades de las sugerencias inteligentes
interface SmartSuggestionsProps {
  onSelect: (suggestion: { description: string; amount: number; category: string }) => void;
  type: TransactionType;
}

// Interfaz para las sugerencias
interface Suggestion {
  description: string;
  amount: number;
  category: string;
}

export function SmartSuggestions({ onSelect, type }: SmartSuggestionsProps) {
  const { state, isLoading } = useFinance()
  const { translate, formatCurrency } = useSettings()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Datos de sugerencias predefinidas como respaldo
  const defaultIncomeSuggestions = [
    { description: "Salario mensual", amount: 1500, category: "Salario" },
    { description: "Pago de freelance", amount: 300, category: "Freelance" },
    { description: "Reembolso", amount: 50, category: "Reembolsos" },
  ]

  const defaultExpenseSuggestions = [
    { description: "Compra supermercado", amount: 85, category: "Alimentación" },
    { description: "Factura de electricidad", amount: 60, category: "Servicios" },
    { description: "Transporte público", amount: 30, category: "Transporte" },
    { description: "Cena restaurante", amount: 45, category: "Ocio" },
  ]

  // Generar sugerencias inteligentes basadas en el historial de transacciones
  useEffect(() => {
    if (isLoading) return

    // Filtrar transacciones por tipo (ingreso o gasto)
    const relevantTransactions = state.transactions.filter(t => 
      type === "ingreso" ? t.type === "income" : t.type === "expense"
    )

    if (relevantTransactions.length === 0) {
      // Si no hay transacciones relevantes, usar las sugerencias predeterminadas
      setSuggestions(type === "ingreso" ? defaultIncomeSuggestions : defaultExpenseSuggestions)
      return
    }

    // Agrupar transacciones por categoría y calcular promedios
    const categoryGroups: Record<string, { count: number, total: number, descriptions: string[] }> = {}
    
    relevantTransactions.forEach(transaction => {
      const category = transaction.category || "other"
      
      if (!categoryGroups[category]) {
        categoryGroups[category] = { count: 0, total: 0, descriptions: [] }
      }
      
      categoryGroups[category].count++
      categoryGroups[category].total += transaction.amount
      
      if (transaction.description && !categoryGroups[category].descriptions.includes(transaction.description)) {
        categoryGroups[category].descriptions.push(transaction.description)
      }
    })
    
    // Convertir los grupos en sugerencias
    const dynamicSuggestions: Suggestion[] = []
    
    for (const category in categoryGroups) {
      const group = categoryGroups[category]
      const avgAmount = Math.round(group.total / group.count)
      
      // Usar descripción existente o generar una genérica
      const description = group.descriptions.length > 0 
        ? group.descriptions[0] 
        : `${type === "ingreso" ? "Ingreso" : "Gasto"} de ${translate(`category.${category}`) || category}`
      
      dynamicSuggestions.push({
        description,
        amount: avgAmount,
        category
      })
    }
    
    // Ordenar por frecuencia (más comunes primero) y limitar a 4 sugerencias
    const sortedSuggestions = dynamicSuggestions
      .sort((a, b) => (categoryGroups[b.category]?.count || 0) - (categoryGroups[a.category]?.count || 0))
      .slice(0, 4)
    
    setSuggestions(sortedSuggestions)
  }, [isLoading, state.transactions, type, translate])

  return (
    <Card className="border-dashed border-muted-foreground/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sugerencias rápidas</CardTitle>
        <CardDescription>
          Selecciona una de estas transacciones comunes para ahorrar tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto py-1.5 px-3"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion.description} ({formatCurrency(suggestion.amount)})
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
