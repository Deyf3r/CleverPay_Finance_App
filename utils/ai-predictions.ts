import type { Transaction, TransactionCategory } from "@/types/finance"
import {
  format,
  addMonths,
  parseISO,
  startOfMonth,
  subMonths,
  isSameMonth,
  isAfter,
  isBefore,
  differenceInMonths,
} from "date-fns"

// Función mejorada para predecir gastos futuros basados en patrones históricos
export function predictExpenses(transactions: Transaction[], months = 3): { month: string; amount: number }[] {
  const currentDate = new Date()
  const predictions = []

  // Obtener datos de los últimos 12 meses para un análisis más completo
  const oneYearAgo = subMonths(currentDate, 12)

  // Agrupar transacciones por mes
  const monthlyExpenses: Record<string, number> = {}
  const monthlyExpensesByCategory: Record<string, Record<string, number>> = {}

  // Inicializar arrays para análisis de tendencias
  const monthKeys: string[] = []
  const expenseValues: number[] = []

  // Recopilar datos históricos
  transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), oneYearAgo))
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const monthKey = format(date, "MMM yyyy")
      const category = transaction.category

      // Acumular gastos mensuales
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0
        monthlyExpensesByCategory[monthKey] = {}
        monthKeys.push(monthKey)
      }

      monthlyExpenses[monthKey] += transaction.amount

      // Acumular gastos por categoría
      if (!monthlyExpensesByCategory[monthKey][category]) {
        monthlyExpensesByCategory[monthKey][category] = 0
      }
      monthlyExpensesByCategory[monthKey][category] += transaction.amount
    })

  // Ordenar meses cronológicamente
  monthKeys.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  // Extraer valores de gastos en orden cronológico
  monthKeys.forEach((key) => {
    expenseValues.push(monthlyExpenses[key])
  })

  // Análisis de tendencia usando regresión lineal simple
  let slope = 0
  const seasonalFactors: Record<string, number> = {}

  if (expenseValues.length >= 2) {
    // Calcular tendencia (pendiente)
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0
    const n = expenseValues.length

    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += expenseValues[i]
      sumXY += i * expenseValues[i]
      sumX2 += i * i
    }

    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)

    // Calcular factores estacionales (por mes del año)
    const monthFactors: Record<string, { sum: number; count: number }> = {}

    monthKeys.forEach((monthKey, i) => {
      const month = format(new Date(monthKey), "MMMM")
      if (!monthFactors[month]) {
        monthFactors[month] = { sum: 0, count: 0 }
      }

      // Eliminar la tendencia para calcular el factor estacional
      const expectedValue = expenseValues[0] + slope * i
      const seasonalComponent = expenseValues[i] / expectedValue

      monthFactors[month].sum += seasonalComponent
      monthFactors[month].count += 1
    })

    // Calcular el promedio de los factores estacionales
    Object.keys(monthFactors).forEach((month) => {
      seasonalFactors[month] = monthFactors[month].sum / monthFactors[month].count
    })
  }

  // Calcular el promedio de gastos mensuales recientes (últimos 3 meses)
  const recentMonths = monthKeys.slice(-3)
  const avgRecentMonthlyExpense =
    recentMonths.length > 0 ? recentMonths.reduce((sum, key) => sum + monthlyExpenses[key], 0) / recentMonths.length : 0

  // Generar predicciones para los próximos meses
  for (let i = 1; i <= months; i++) {
    const futureMonth = addMonths(currentDate, i)
    const monthKey = format(futureMonth, "MMM yyyy")
    const monthName = format(futureMonth, "MMMM")

    // Base de predicción: promedio reciente + tendencia
    let predictedAmount = avgRecentMonthlyExpense + slope * i

    // Aplicar factor estacional si está disponible
    if (seasonalFactors[monthName]) {
      predictedAmount *= seasonalFactors[monthName]
    } else {
      // Ajustes estacionales genéricos si no hay datos históricos suficientes
      if (monthName === "December") {
        predictedAmount *= 1.25 // 25% más de gastos en diciembre (navidad)
      } else if (monthName === "January") {
        predictedAmount *= 0.85 // 15% menos de gastos en enero (post-navidad)
      } else if (["June", "July", "August"].includes(monthName)) {
        predictedAmount *= 1.1 // 10% más en verano
      }
    }

    // Análisis de categorías para predicciones más precisas
    const predictedCategories: Record<string, number> = {}

    // Distribuir el monto predicho entre categorías basado en patrones históricos
    if (recentMonths.length > 0) {
      const categoryDistribution: Record<string, number> = {}
      let totalExpenses = 0

      // Calcular la distribución promedio de categorías en los meses recientes
      recentMonths.forEach((month) => {
        const categories = monthlyExpensesByCategory[month] || {}
        Object.entries(categories).forEach(([category, amount]) => {
          if (!categoryDistribution[category]) categoryDistribution[category] = 0
          categoryDistribution[category] += amount
          totalExpenses += amount
        })
      })

      // Normalizar la distribución
      if (totalExpenses > 0) {
        Object.keys(categoryDistribution).forEach((category) => {
          categoryDistribution[category] /= totalExpenses
        })
      }

      // Aplicar la distribución a la predicción
      Object.entries(categoryDistribution).forEach(([category, ratio]) => {
        predictedCategories[category] = predictedAmount * ratio
      })
    }

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
      categories: predictedCategories,
    })
  }

  return predictions
}

// Función mejorada para predecir ingresos futuros
export function predictIncome(transactions: Transaction[], months = 3): { month: string; amount: number }[] {
  const currentDate = new Date()
  const predictions = []

  // Obtener datos de los últimos 12 meses
  const oneYearAgo = subMonths(currentDate, 12)

  // Agrupar transacciones por mes
  const monthlyIncome: Record<string, number> = {}
  const monthlyIncomeBySource: Record<string, Record<string, number>> = {}

  // Inicializar arrays para análisis de tendencias
  const monthKeys: string[] = []
  const incomeValues: number[] = []

  // Recopilar datos históricos
  transactions
    .filter((t) => t.type === "income" && isAfter(parseISO(t.date), oneYearAgo))
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const monthKey = format(date, "MMM yyyy")
      const category = transaction.category

      // Acumular ingresos mensuales
      if (!monthlyIncome[monthKey]) {
        monthlyIncome[monthKey] = 0
        monthlyIncomeBySource[monthKey] = {}
        monthKeys.push(monthKey)
      }

      monthlyIncome[monthKey] += transaction.amount

      // Acumular ingresos por fuente (categoría)
      if (!monthlyIncomeBySource[monthKey][category]) {
        monthlyIncomeBySource[monthKey][category] = 0
      }
      monthlyIncomeBySource[monthKey][category] += transaction.amount
    })

  // Ordenar meses cronológicamente
  monthKeys.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  // Extraer valores de ingresos en orden cronológico
  monthKeys.forEach((key) => {
    incomeValues.push(monthlyIncome[key])
  })

  // Detectar patrones de ingresos recurrentes
  const recurringIncome: Record<string, { amount: number; frequency: number; lastDate: Date }> = {}

  // Analizar transacciones para identificar ingresos recurrentes
  transactions
    .filter((t) => t.type === "income" && isAfter(parseISO(t.date), oneYearAgo))
    .forEach((transaction) => {
      const key = `${transaction.description}-${transaction.amount}`
      if (!recurringIncome[key]) {
        recurringIncome[key] = {
          amount: transaction.amount,
          frequency: 0, // Meses entre ocurrencias
          lastDate: parseISO(transaction.date),
        }
      } else {
        // Actualizar la frecuencia y la última fecha
        const currentDate = parseISO(transaction.date)
        const monthsDiff = differenceInMonths(currentDate, recurringIncome[key].lastDate)

        if (monthsDiff > 0) {
          // Actualizar la frecuencia como un promedio ponderado
          recurringIncome[key].frequency =
            recurringIncome[key].frequency === 0 ? monthsDiff : recurringIncome[key].frequency * 0.7 + monthsDiff * 0.3

          recurringIncome[key].lastDate = currentDate
        }
      }
    })

  // Análisis de tendencia usando regresión lineal simple
  let slope = 0
  let intercept = 0

  if (incomeValues.length >= 2) {
    // Calcular tendencia (pendiente)
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0
    const n = incomeValues.length

    for (let i = 0; i < n; i++) {
      sumX += i
      sumY += incomeValues[i]
      sumXY += i * incomeValues[i]
      sumX2 += i * i
    }

    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    intercept = (sumY - slope * sumX) / n
  }

  // Calcular el promedio de ingresos mensuales recientes (últimos 3 meses)
  const recentMonths = monthKeys.slice(-3)
  const avgRecentMonthlyIncome =
    recentMonths.length > 0 ? recentMonths.reduce((sum, key) => sum + monthlyIncome[key], 0) / recentMonths.length : 0

  // Generar predicciones para los próximos meses
  for (let i = 1; i <= months; i++) {
    const futureMonth = addMonths(currentDate, i)
    const monthKey = format(futureMonth, "MMM yyyy")

    // Base de predicción: promedio reciente + tendencia
    let predictedAmount =
      avgRecentMonthlyIncome > 0
        ? avgRecentMonthlyIncome + slope * i
        : intercept + slope * (incomeValues.length + i - 1)

    // Añadir ingresos recurrentes esperados
    Object.values(recurringIncome).forEach((income) => {
      if (income.frequency > 0) {
        const monthsSinceLastOccurrence = differenceInMonths(futureMonth, income.lastDate)
        // Si es momento de que ocurra según la frecuencia
        if (Math.abs(monthsSinceLastOccurrence % income.frequency) < 0.5) {
          predictedAmount += income.amount
        }
      }
    })

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
    })
  }

  return predictions
}

// Función mejorada para identificar categorías de gastos anómalos
export function identifyAnomalousSpending(
  transactions: Transaction[],
): { category: string; amount: number; percentageIncrease: number; averageAmount: number; description: string }[] {
  const currentDate = new Date()
  const currentMonth = startOfMonth(currentDate)
  const lastMonth = startOfMonth(subMonths(currentDate, 1))
  const threeMonthsAgo = startOfMonth(subMonths(currentDate, 3))

  // Agrupar gastos por categoría para diferentes períodos
  const currentMonthExpenses: Record<string, number> = {}
  const lastMonthExpenses: Record<string, number> = {}
  const historicalExpenses: Record<string, number[]> = {}
  const transactionCounts: Record<string, number> = {}

  transactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const category = transaction.category

      // Inicializar arrays si es necesario
      if (!historicalExpenses[category]) {
        historicalExpenses[category] = []
        transactionCounts[category] = 0
      }

      // Incrementar contador de transacciones para esta categoría
      transactionCounts[category]++

      // Agrupar por período
      if (isSameMonth(date, currentMonth)) {
        if (!currentMonthExpenses[category]) currentMonthExpenses[category] = 0
        currentMonthExpenses[category] += transaction.amount
      } else if (isSameMonth(date, lastMonth)) {
        if (!lastMonthExpenses[category]) lastMonthExpenses[category] = 0
        lastMonthExpenses[category] += transaction.amount
      }

      // Recopilar datos históricos (últimos 3 meses)
      if (isAfter(date, threeMonthsAgo) && !isSameMonth(date, currentMonth)) {
        historicalExpenses[category].push(transaction.amount)
      }
    })

  // Calcular promedios históricos y desviaciones estándar
  const categoryStats: Record<string, { avg: number; stdDev: number }> = {}

  Object.entries(historicalExpenses).forEach(([category, amounts]) => {
    if (amounts.length > 0) {
      const sum = amounts.reduce((acc, val) => acc + val, 0)
      const avg = sum / amounts.length

      // Calcular desviación estándar
      const squaredDiffs = amounts.map((val) => Math.pow(val - avg, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / amounts.length
      const stdDev = Math.sqrt(variance)

      categoryStats[category] = { avg, stdDev }
    }
  })

  // Identificar anomalías
  const anomalies = []

  for (const [category, amount] of Object.entries(currentMonthExpenses)) {
    const lastMonthAmount = lastMonthExpenses[category] || 0
    const stats = categoryStats[category]

    // Criterios para considerar una anomalía:
    // 1. Debe haber datos históricos suficientes
    // 2. El gasto actual debe ser significativo (> $20)
    // 3. Debe haber un aumento significativo respecto al mes anterior O
    //    debe estar fuera del rango normal (promedio + 2*desviación estándar)
    if (amount > 20 && stats && transactionCounts[category] >= 3) {
      let isAnomaly = false
      let percentageIncrease = 0

      // Calcular aumento porcentual respecto al mes anterior
      if (lastMonthAmount > 0) {
        percentageIncrease = ((amount - lastMonthAmount) / lastMonthAmount) * 100
        if (percentageIncrease >= 30) {
          isAnomaly = true
        }
      }

      // Verificar si está fuera del rango normal
      if (!isAnomaly && amount > stats.avg + 2 * stats.stdDev) {
        isAnomaly = true
        percentageIncrease = ((amount - stats.avg) / stats.avg) * 100
      }

      if (isAnomaly) {
        // Generar descripción personalizada
        let description = ""

        if (percentageIncrease > 100) {
          description = `Gasto extremadamente alto en comparación con patrones anteriores.`
        } else if (percentageIncrease > 50) {
          description = `Aumento significativo respecto a los gastos habituales.`
        } else {
          description = `Gasto superior al promedio histórico.`
        }

        anomalies.push({
          category,
          amount,
          percentageIncrease,
          averageAmount: stats.avg,
          description,
        })
      }
    }
  }

  // Ordenar por porcentaje de aumento
  return anomalies.sort((a, b) => b.percentageIncrease - a.percentageIncrease)
}

// Función mejorada para sugerir metas de ahorro
export function suggestSavingsGoals(transactions: Transaction[]): {
  amount: number
  description: string
  potentialSavings: { category: string; amount: number; suggestion: string }[]
  savingsRate: number
} {
  // Obtener predicciones para el próximo mes
  const monthlyIncome = predictIncome(transactions, 1)[0]?.amount || 0
  const monthlyExpenses = predictExpenses(transactions, 1)[0]?.amount || 0

  const availableForSavings = monthlyIncome - monthlyExpenses
  const savingsRate = monthlyIncome > 0 ? (availableForSavings / monthlyIncome) * 100 : 0

  // Analizar gastos por categoría para identificar áreas de ahorro potencial
  const currentDate = new Date()
  const threeMonthsAgo = subMonths(currentDate, 3)

  const categoryExpenses: Record<string, number[]> = {}

  transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), threeMonthsAgo))
    .forEach((transaction) => {
      const category = transaction.category
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = []
      }
      categoryExpenses[category].push(transaction.amount)
    })

  // Identificar categorías con potencial de ahorro
  const potentialSavings: { category: string; amount: number; suggestion: string }[] = []

  Object.entries(categoryExpenses).forEach(([category, amounts]) => {
    if (amounts.length >= 3) {
      const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0)
      const avgMonthlySpent = totalSpent / amounts.length

      // Diferentes estrategias según la categoría
      let savingsPotential = 0
      let suggestion = ""

      switch (category) {
        case "food":
          savingsPotential = avgMonthlySpent * 0.15
          suggestion = "Considera preparar más comidas en casa o usar cupones de descuento."
          break
        case "entertainment":
          savingsPotential = avgMonthlySpent * 0.25
          suggestion = "Busca alternativas gratuitas o de menor costo para entretenimiento."
          break
        case "shopping":
          savingsPotential = avgMonthlySpent * 0.2
          suggestion = "Considera esperar a las rebajas o comparar precios antes de comprar."
          break
        case "transportation":
          savingsPotential = avgMonthlySpent * 0.1
          suggestion = "Considera opciones de transporte público o compartir viajes."
          break
        case "utilities":
          savingsPotential = avgMonthlySpent * 0.08
          suggestion = "Revisa tus planes de servicios y busca opciones más económicas."
          break
        default:
          // Para otras categorías, sugerir un ahorro modesto
          savingsPotential = avgMonthlySpent * 0.05
          suggestion = "Revisa tus gastos en esta categoría para identificar posibles ahorros."
      }

      if (savingsPotential >= 10) {
        // Solo sugerir si el ahorro es significativo
        potentialSavings.push({
          category,
          amount: savingsPotential,
          suggestion,
        })
      }
    }
  })

  // Ordenar por potencial de ahorro
  potentialSavings.sort((a, b) => b.amount - a.amount)

  // Calcular meta de ahorro recomendada
  let suggestedSavings = 0
  let description = ""

  if (availableForSavings <= 0) {
    // Si no hay fondos disponibles, sugerir ahorros basados en recortes potenciales
    const totalPotentialSavings = potentialSavings.reduce((sum, item) => sum + item.amount, 0)
    suggestedSavings = totalPotentialSavings * 0.7 // 70% de los ahorros potenciales identificados

    description = `Basado en tus patrones de gasto, podrías ahorrar aproximadamente ${suggestedSavings.toFixed(2)} al mes haciendo algunos ajustes en tus gastos. Revisa las sugerencias específicas por categoría.`
  } else {
    // Si hay fondos disponibles, sugerir un porcentaje de ellos
    const targetSavingsRate = 0.2 // Meta: ahorrar 20% de los ingresos

    if (savingsRate >= targetSavingsRate * 100) {
      // Ya está ahorrando suficiente
      suggestedSavings = availableForSavings
      description = `¡Excelente! Ya estás ahorrando un ${savingsRate.toFixed(1)}% de tus ingresos, lo cual es una tasa saludable. Puedes mantener tu meta actual de ahorro.`
    } else {
      // Necesita aumentar su tasa de ahorro
      const idealSavings = monthlyIncome * targetSavingsRate
      suggestedSavings = Math.min(
        idealSavings,
        availableForSavings + potentialSavings.reduce((sum, item) => sum + item.amount, 0) * 0.5,
      )

      description = `Te recomendamos ahorrar aproximadamente ${suggestedSavings.toFixed(2)} por mes, lo que representaría un ${((suggestedSavings / monthlyIncome) * 100).toFixed(1)}% de tus ingresos. Esto te ayudará a construir un fondo de emergencia y alcanzar tus metas financieras.`
    }
  }

  return {
    amount: suggestedSavings,
    description,
    potentialSavings: potentialSavings.slice(0, 3), // Top 3 áreas de ahorro
    savingsRate,
  }
}

// Función mejorada para categorizar automáticamente una transacción basada en su descripción
export function categorizeTranasction(description: string): {
  category: TransactionCategory
  confidence: number
  alternativeCategories: { category: TransactionCategory; confidence: number }[]
} {
  description = description.toLowerCase()

  // Mapeo de palabras clave a categorías con pesos
  const categoryKeywords: Record<TransactionCategory, { terms: string[]; weights: number[] }> = {
    food: {
      terms: [
        "grocery",
        "restaurant",
        "cafe",
        "coffee",
        "food",
        "meal",
        "dinner",
        "lunch",
        "breakfast",
        "supermarket",
        "burger",
        "pizza",
        "taco",
        "sushi",
      ],
      weights: [1, 1, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 0.9],
    },
    transportation: {
      terms: [
        "gas",
        "fuel",
        "uber",
        "lyft",
        "taxi",
        "car",
        "auto",
        "vehicle",
        "transport",
        "bus",
        "train",
        "subway",
        "metro",
        "parking",
        "toll",
      ],
      weights: [1, 1, 1, 1, 1, 0.8, 0.7, 0.7, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    housing: {
      terms: [
        "rent",
        "mortgage",
        "apartment",
        "house",
        "property",
        "real estate",
        "lease",
        "landlord",
        "maintenance",
        "repair",
        "home",
        "condo",
        "hoa",
      ],
      weights: [1, 1, 0.9, 0.8, 0.8, 0.9, 0.9, 0.9, 0.7, 0.7, 0.7, 0.9, 0.9],
    },
    utilities: {
      terms: [
        "electric",
        "water",
        "gas",
        "internet",
        "phone",
        "utility",
        "bill",
        "service",
        "cable",
        "tv",
        "streaming",
        "subscription",
        "wifi",
      ],
      weights: [1, 1, 0.9, 1, 0.9, 1, 0.8, 0.7, 0.9, 0.8, 0.8, 0.7, 0.9],
    },
    entertainment: {
      terms: [
        "movie",
        "theatre",
        "concert",
        "show",
        "game",
        "subscription",
        "netflix",
        "spotify",
        "disney",
        "hulu",
        "amazon prime",
        "ticket",
        "event",
        "festival",
      ],
      weights: [1, 1, 1, 0.8, 0.8, 0.7, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    health: {
      terms: [
        "doctor",
        "medical",
        "health",
        "pharmacy",
        "medicine",
        "fitness",
        "gym",
        "hospital",
        "clinic",
        "dental",
        "vision",
        "insurance",
        "therapy",
        "vitamin",
      ],
      weights: [1, 1, 0.9, 1, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 0.8, 0.9, 0.8],
    },
    shopping: {
      terms: [
        "amazon",
        "walmart",
        "target",
        "store",
        "mall",
        "shop",
        "purchase",
        "buy",
        "clothing",
        "electronics",
        "furniture",
        "retail",
        "online",
      ],
      weights: [0.9, 0.9, 0.9, 0.8, 0.8, 0.8, 0.7, 0.7, 0.9, 0.9, 0.9, 0.8, 0.8],
    },
    personal: {
      terms: [
        "haircut",
        "salon",
        "spa",
        "beauty",
        "personal care",
        "grooming",
        "cosmetics",
        "makeup",
        "skincare",
        "barber",
        "manicure",
        "pedicure",
      ],
      weights: [1, 0.9, 0.9, 0.9, 1, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    education: {
      terms: [
        "school",
        "college",
        "university",
        "course",
        "class",
        "book",
        "tuition",
        "student",
        "loan",
        "education",
        "learning",
        "training",
        "workshop",
        "seminar",
      ],
      weights: [0.9, 1, 1, 0.9, 0.8, 0.7, 1, 0.8, 0.8, 1, 0.9, 0.9, 0.9, 0.9],
    },
    travel: {
      terms: [
        "hotel",
        "flight",
        "airline",
        "vacation",
        "trip",
        "travel",
        "booking",
        "airbnb",
        "resort",
        "cruise",
        "tour",
        "holiday",
        "lodging",
      ],
      weights: [1, 1, 0.9, 1, 0.9, 1, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    salary: {
      terms: [
        "salary",
        "paycheck",
        "income",
        "wage",
        "payment",
        "deposit",
        "direct deposit",
        "payroll",
        "compensation",
        "bonus",
        "commission",
      ],
      weights: [1, 1, 0.9, 0.9, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    investment: {
      terms: [
        "dividend",
        "interest",
        "stock",
        "bond",
        "investment",
        "return",
        "portfolio",
        "fund",
        "etf",
        "mutual fund",
        "roth",
        "ira",
        "401k",
        "brokerage",
      ],
      weights: [1, 0.9, 0.9, 0.9, 1, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9],
    },
    other: {
      terms: ["other", "miscellaneous", "misc", "various", "general", "unknown"],
      weights: [1, 1, 1, 0.9, 0.9, 0.8],
    },
  }

  // Sistema de puntuación para determinar la categoría
  const scores: Record<string, number> = {}

  // Inicializar puntuaciones
  Object.keys(categoryKeywords).forEach((category) => {
    scores[category] = 0
  })

  // Calcular puntuaciones basadas en coincidencias de palabras clave
  Object.entries(categoryKeywords).forEach(([category, data]) => {
    data.terms.forEach((term, index) => {
      if (description.includes(term)) {
        scores[category] += data.weights[index]
      }
    })
  })

  // Análisis contextual adicional
  // Patrones numéricos para mejorar la precisión
  const amountPattern = /\$?\d+(\.\d{2})?/
  if (amountPattern.test(description)) {
    // Si hay un monto, probablemente sea una transacción de compra
    if (scores["shopping"] > 0) scores["shopping"] *= 1.2
    if (scores["food"] > 0) scores["food"] *= 1.2
  }

  // Palabras que indican periodicidad (probablemente servicios o suscripciones)
  if (/monthly|subscription|recurring|bill/i.test(description)) {
    if (scores["utilities"] > 0) scores["utilities"] *= 1.3
    if (scores["entertainment"] > 0) scores["entertainment"] *= 1.2
  }

  // Encontrar la categoría con mayor puntuación
  let bestCategory: TransactionCategory = "other"
  let highestScore = 0

  Object.entries(scores).forEach(([category, score]) => {
    if (score > highestScore) {
      highestScore = score
      bestCategory = category as TransactionCategory
    }
  })

  // Calcular nivel de confianza (normalizado entre 0 y 1)
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const confidence = totalScore > 0 ? highestScore / totalScore : 0

  // Encontrar categorías alternativas
  const alternatives: { category: TransactionCategory; confidence: number }[] = []

  Object.entries(scores).forEach(([category, score]) => {
    if (category !== bestCategory && score > 0) {
      alternatives.push({
        category: category as TransactionCategory,
        confidence: totalScore > 0 ? score / totalScore : 0,
      })
    }
  })

  // Ordenar alternativas por confianza
  alternatives.sort((a, b) => b.confidence - a.confidence)

  return {
    category: bestCategory,
    confidence: Math.min(confidence, 0.95), // Limitar confianza máxima a 95%
    alternativeCategories: alternatives.slice(0, 2), // Devolver solo las 2 mejores alternativas
  }
}

// Función para analizar patrones de gasto y generar insights personalizados
export function generateFinancialInsights(transactions: Transaction[]): {
  insights: string[]
  spendingTrends: { category: string; trend: "increasing" | "decreasing" | "stable"; percentage: number }[]
  topExpenseCategories: { category: string; percentage: number; amount: number }[]
} {
  const currentDate = new Date()
  const threeMonthsAgo = subMonths(currentDate, 3)
  const sixMonthsAgo = subMonths(currentDate, 6)

  // Filtrar transacciones recientes
  const recentTransactions = transactions.filter((t) => isAfter(parseISO(t.date), threeMonthsAgo))
  const olderTransactions = transactions.filter(
    (t) => isAfter(parseISO(t.date), sixMonthsAgo) && isBefore(parseISO(t.date), threeMonthsAgo),
  )

  // Calcular gastos por categoría para diferentes períodos
  const recentExpensesByCategory: Record<string, number> = {}
  const olderExpensesByCategory: Record<string, number> = {}
  let totalRecentExpenses = 0

  recentTransactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const category = transaction.category
      if (!recentExpensesByCategory[category]) recentExpensesByCategory[category] = 0
      recentExpensesByCategory[category] += transaction.amount
      totalRecentExpenses += transaction.amount
    })

  olderTransactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const category = transaction.category
      if (!olderExpensesByCategory[category]) olderExpensesByCategory[category] = 0
      olderExpensesByCategory[category] += transaction.amount
    })

  // Calcular tendencias de gasto
  const spendingTrends: { category: string; trend: "increasing" | "decreasing" | "stable"; percentage: number }[] = []

  Object.entries(recentExpensesByCategory).forEach(([category, amount]) => {
    const olderAmount = olderExpensesByCategory[category] || 0

    if (olderAmount > 0 && amount > 50) {
      // Solo considerar categorías con gastos significativos
      const changePercentage = ((amount - olderAmount) / olderAmount) * 100

      let trend: "increasing" | "decreasing" | "stable" = "stable"
      if (changePercentage > 10) trend = "increasing"
      else if (changePercentage < -10) trend = "decreasing"

      spendingTrends.push({
        category,
        trend,
        percentage: Math.abs(changePercentage),
      })
    }
  })

  // Ordenar tendencias por magnitud del cambio
  spendingTrends.sort((a, b) => b.percentage - a.percentage)

  // Calcular categorías principales de gasto
  const topExpenseCategories: { category: string; percentage: number; amount: number }[] = []

  if (totalRecentExpenses > 0) {
    Object.entries(recentExpensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalRecentExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5) // Top 5 categorías
      .forEach((item) => {
        topExpenseCategories.push(item)
      })
  }

  // Generar insights basados en los datos
  const insights: string[] = []

  // Insight sobre distribución de gastos
  if (topExpenseCategories.length > 0) {
    const topCategory = topExpenseCategories[0]
    insights.push(
      `Tu categoría principal de gasto es ${topCategory.category}, representando el ${topCategory.percentage.toFixed(1)}% de tus gastos totales.`,
    )
  }

  // Insights sobre tendencias
  spendingTrends.slice(0, 3).forEach((trend) => {
    if (trend.trend === "increasing") {
      insights.push(
        `Tus gastos en ${trend.category} han aumentado un ${trend.percentage.toFixed(1)}% en los últimos 3 meses.`,
      )
    } else if (trend.trend === "decreasing") {
      insights.push(
        `Has reducido tus gastos en ${trend.category} un ${trend.percentage.toFixed(1)}% en los últimos 3 meses. ¡Buen trabajo!`,
      )
    }
  })

  // Insight sobre balance general
  const recentIncome = recentTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  if (recentIncome > 0) {
    const savingsRate = ((recentIncome - totalRecentExpenses) / recentIncome) * 100

    if (savingsRate > 20) {
      insights.push(
        `¡Excelente trabajo! Estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos, lo cual es una tasa saludable.`,
      )
    } else if (savingsRate > 0) {
      insights.push(
        `Estás ahorrando el ${savingsRate.toFixed(1)}% de tus ingresos. Considera aumentar tu tasa de ahorro al 20% para mejorar tu salud financiera.`,
      )
    } else {
      insights.push(
        `Tus gastos superan tus ingresos en los últimos 3 meses. Considera revisar tu presupuesto para evitar endeudamiento.`,
      )
    }
  }

  return {
    insights,
    spendingTrends,
    topExpenseCategories,
  }
}

