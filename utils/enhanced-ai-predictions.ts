import type { Transaction, TransactionCategory } from "@/types/finance"
import {
  format,
  addMonths,
  parseISO,
  startOfMonth,
  subMonths,
  isSameMonth,
  isAfter,
  differenceInDays,
  getMonth,
  getYear,
  isBefore,
  addDays,
  compareAsc,
} from "date-fns"

// Tipos avanzados para las predicciones
export interface ExpensePrediction {
  month: string
  amount: number
  categories: Record<string, number>
  confidence: number
  trend: "increasing" | "decreasing" | "stable"
  volatility: number
  seasonalFactors: Record<string, number>
  recurringExpenses: RecurringExpense[]
  anomalyRisk: number
}

export interface IncomePrediction {
  month: string
  amount: number
  sources: Record<string, number>
  confidence: number
  trend: "increasing" | "decreasing" | "stable"
  volatility: number
  seasonalFactors: Record<string, number>
  recurringIncome: RecurringIncome[]
}

interface RecurringExpense {
  description: string
  category: TransactionCategory
  amount: number
  date: string
  confidence: number
}

interface RecurringIncome {
  description: string
  category: TransactionCategory
  amount: number
  date: string
  confidence: number
}

// Función mejorada para predecir gastos futuros con análisis avanzado
export function predictExpenses(transactions: Transaction[], months = 3): ExpensePrediction[] {
  const currentDate = new Date()
  const predictions: ExpensePrediction[] = []

  // Obtener datos de los últimos 24 meses para un análisis más completo
  const twoYearsAgo = subMonths(currentDate, 24)

  // Agrupar transacciones por mes
  const monthlyExpenses: Record<string, number> = {}
  const monthlyExpensesByCategory: Record<string, Record<string, number>> = {}
  const monthlyTransactionCounts: Record<string, number> = {}
  const categoryFrequency: Record<string, { count: number; total: number }> = {}

  // Inicializar arrays para análisis de tendencias
  const monthKeys: string[] = []
  const expenseValues: number[] = []
  const monthNumbers: number[] = [] // Para análisis de estacionalidad
  const dateObjects: Date[] = [] // Para análisis cronológico

  // Recopilar datos históricos
  transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), twoYearsAgo))
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const monthKey = format(date, "MMM yyyy")
      const category = transaction.category
      const monthNumber = getMonth(date) // 0-11 para análisis de estacionalidad

      // Acumular gastos mensuales
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0
        monthlyExpensesByCategory[monthKey] = {}
        monthlyTransactionCounts[monthKey] = 0
        monthKeys.push(monthKey)
        monthNumbers.push(monthNumber)
        dateObjects.push(startOfMonth(date))
      }

      monthlyExpenses[monthKey] += transaction.amount
      monthlyTransactionCounts[monthKey]++

      // Acumular gastos por categoría
      if (!monthlyExpensesByCategory[monthKey][category]) {
        monthlyExpensesByCategory[monthKey][category] = 0
      }
      monthlyExpensesByCategory[monthKey][category] += transaction.amount

      // Acumular frecuencia de categorías
      if (!categoryFrequency[category]) {
        categoryFrequency[category] = { count: 0, total: 0 }
      }
      categoryFrequency[category].count++
      categoryFrequency[category].total += transaction.amount
    })

  // Ordenar meses cronológicamente
  const sortedMonthIndices = dateObjects
    .map((date, index) => ({ date, index }))
    .sort((a, b) => compareAsc(a.date, b.date))
    .map((item) => item.index)

  // Extraer valores de gastos en orden cronológico
  sortedMonthIndices.forEach((index) => {
    expenseValues.push(monthlyExpenses[monthKeys[index]])
  })

  // Análisis de tendencia usando regresión lineal avanzada
  let slope = 0
  let intercept = 0
  const seasonalFactors: Record<number, number> = {}
  let confidenceBase = 0.7 // Confianza base

  if (expenseValues.length >= 6) {
    // Algoritmo de regresión lineal ponderada para darle más importancia a datos recientes
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumWeights = 0
    const n = expenseValues.length

    for (let i = 0; i < n; i++) {
      // Ponderación exponencial: datos más recientes tienen mayor peso
      const weight = Math.exp(0.3 * (i / (n - 1)))

      sumX += i * weight
      sumY += expenseValues[i] * weight
      sumXY += i * expenseValues[i] * weight
      sumX2 += i * i * weight
      sumWeights += weight
    }

    slope = (sumWeights * sumXY - sumX * sumY) / (sumWeights * sumX2 - sumX * sumX)
    intercept = (sumY - slope * sumX) / sumWeights

    // Verificar si la tendencia es estadísticamente significativa
    // Si R² es muy bajo, preferimos considerar la tendencia como menos significativa
    const meanY = sumY / sumWeights
    let totalSumSquares = 0
    let residualSumSquares = 0

    for (let i = 0; i < n; i++) {
      const weight = Math.exp(0.3 * (i / (n - 1)))
      totalSumSquares += weight * Math.pow(expenseValues[i] - meanY, 2)
      residualSumSquares += weight * Math.pow(expenseValues[i] - (intercept + slope * i), 2)
    }

    const rSquared = 1 - residualSumSquares / totalSumSquares

    // Si R² es bajo, reducir el efecto de la tendencia
    if (rSquared < 0.2) {
      slope *= rSquared * 2 // Reducir la pendiente proporcionalmente
    }

    // Calcular factores estacionales (por mes del año)
    const monthFactors: Record<number, { sum: number; count: number }> = {}

    sortedMonthIndices.forEach((index, i) => {
      const date = dateObjects[index]
      const month = getMonth(date)
      if (!monthFactors[month]) {
        monthFactors[month] = { sum: 0, count: 0 }
      }

      // Eliminar la tendencia para calcular el factor estacional
      const expectedValue = intercept + slope * i
      const seasonalComponent = expenseValues[i] / (expectedValue || 1)

      monthFactors[month].sum += seasonalComponent
      monthFactors[month].count += 1
    })

    // Calcular el promedio de los factores estacionales
    Object.keys(monthFactors).forEach((month) => {
      const m = Number.parseInt(month)
      seasonalFactors[m] = monthFactors[m].sum / monthFactors[m].count
    })

    // Ajustar confianza según la cantidad de datos
    if (expenseValues.length >= 12) {
      confidenceBase = 0.85 // Más datos, mayor confianza
    }
  } else {
    // Pocos datos, menor confianza
    confidenceBase = 0.6
  }

  // Calcular el promedio de gastos mensuales recientes (últimos 3 meses)
  const recentMonths = sortedMonthIndices.slice(-3).map((index) => monthKeys[index])
  const avgRecentMonthlyExpense =
    recentMonths.length > 0 ? recentMonths.reduce((sum, key) => sum + monthlyExpenses[key], 0) / recentMonths.length : 0

  // Calcular la desviación estándar para evaluar la volatilidad
  const calculateStdDev = (values: number[]): number => {
    if (values.length < 2) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length)
  }

  const stdDev = calculateStdDev(expenseValues)
  const volatilityFactor = stdDev / (avgRecentMonthlyExpense || 1)

  // Analizar patrones de gasto recurrentes
  const recurringExpenses: Record<
    string,
    {
      description: string
      amount: number
      category: TransactionCategory
      frequency: number
      lastDate: Date
      nextDates: Date[]
      confidence: number
    }
  > = {}

  // Identificar gastos recurrentes con análisis avanzado
  const expenseTransactions = transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), subMonths(currentDate, 12)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

  // Agrupar transacciones similares
  const transactionGroups: Record<string, Transaction[]> = {}

  expenseTransactions.forEach((transaction) => {
    // Crear una clave basada en descripción y categoría
    const key = `${transaction.description.toLowerCase().trim()}-${transaction.category}`

    if (!transactionGroups[key]) {
      transactionGroups[key] = []
    }

    transactionGroups[key].push(transaction)
  })

  // Analizar cada grupo para detectar patrones recurrentes
  Object.entries(transactionGroups).forEach(([key, transactions]) => {
    if (transactions.length < 2) return // Necesitamos al menos 2 transacciones para detectar un patrón

    const dates = transactions.map((t) => parseISO(t.date)).sort(compareAsc)
    const amounts = transactions.map((t) => t.amount)
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

    // Calcular intervalos entre fechas
    const intervals: number[] = []
    for (let i = 1; i < dates.length; i++) {
      intervals.push(differenceInDays(dates[i], dates[i - 1]))
    }

    // Calcular el intervalo promedio y la desviación estándar
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const stdDevInterval = calculateStdDev(intervals)

    // Determinar si es un patrón recurrente basado en la consistencia de los intervalos
    const isRecurring = stdDevInterval / avgInterval < 0.3 // Menos del 30% de variación

    if (isRecurring) {
      let frequency = Math.round(avgInterval)
      let confidenceScore = 0.7

      // Ajustar confianza basada en la consistencia y número de ocurrencias
      confidenceScore += (1 - stdDevInterval / avgInterval) * 0.2 // Más consistente = mayor confianza
      confidenceScore += Math.min((transactions.length - 2) * 0.05, 0.2) // Más ocurrencias = mayor confianza

      // Limitar confianza a 0.95
      confidenceScore = Math.min(confidenceScore, 0.95)

      // Detectar patrones comunes para mejorar la predicción
      if (Math.abs(frequency - 30) <= 3) {
        frequency = 30 // Mensual
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 14) <= 2) {
        frequency = 14 // Quincenal
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 7) <= 1) {
        frequency = 7 // Semanal
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 90) <= 5) {
        frequency = 90 // Trimestral
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 365) <= 10) {
        frequency = 365 // Anual
        confidenceScore += 0.05
      }

      // Registrar el gasto recurrente
      recurringExpenses[key] = {
        description: transactions[0].description,
        amount: avgAmount,
        category: transactions[0].category,
        frequency,
        lastDate: dates[dates.length - 1],
        nextDates: [],
        confidence: confidenceScore,
      }

      // Calcular próximas fechas
      const lastDate = dates[dates.length - 1]
      for (let i = 1; i <= 6; i++) {
        const nextDate = addDays(lastDate, frequency * i)
        if (isAfter(nextDate, currentDate) && isBefore(nextDate, addMonths(currentDate, months))) {
          recurringExpenses[key].nextDates.push(nextDate)
        }
      }
    }
  })

  // Generar predicciones para los próximos meses
  for (let i = 1; i <= months; i++) {
    const futureMonth = addMonths(currentDate, i)
    const monthKey = format(futureMonth, "MMM yyyy")
    const monthNumber = getMonth(futureMonth)
    const year = getYear(futureMonth)
    const monthName = format(futureMonth, "MMMM")

    // Combinar diferentes modelos de predicción con ensamblado
    const trendModelPrediction = intercept + slope * (expenseValues.length + i - 1)

    // Modelo de promedio reciente
    const recentAvgModelPrediction = avgRecentMonthlyExpense

    // Modelo estacional (si hay suficientes datos históricos)
    let seasonalModelPrediction = avgRecentMonthlyExpense
    if (monthNumber in seasonalFactors) {
      seasonalModelPrediction = avgRecentMonthlyExpense * seasonalFactors[monthNumber]
    }

    // Modelo híbrido basado en la calidad de los datos
    let trendConfidence = expenseValues.length >= 12 ? 0.6 : 0.4 * (expenseValues.length / 12)
    let seasonalConfidence = Object.keys(seasonalFactors).length >= 6 ? 0.5 : 0.3
    let recentAvgConfidence = 0.7 - 0.3 * volatilityFactor // Menos confianza en promedio reciente si hay alta volatilidad

    // Normalizar confianzas para que sumen 1
    const sumConfidences = trendConfidence + seasonalConfidence + recentAvgConfidence
    trendConfidence /= sumConfidences
    seasonalConfidence /= sumConfidences
    recentAvgConfidence /= sumConfidences

    // Predicción final como promedio ponderado de modelos
    let predictedAmount =
      trendModelPrediction * trendConfidence +
      seasonalModelPrediction * seasonalConfidence +
      recentAvgModelPrediction * recentAvgConfidence

    // Ajustes estacionales adicionales basados en patrones comunes
    const month = monthNumber + 1 // 1-12 para legibilidad
    let seasonalAdjustment = 1

    if (month === 12) {
      // Diciembre (navidad)
      seasonalAdjustment *= 1.15
    } else if (month === 1) {
      // Enero (post-navidad)
      seasonalAdjustment *= 0.9
    } else if ([6, 7, 8].includes(month)) {
      // Verano
      seasonalAdjustment *= 1.05
    } else if ([4, 9].includes(month)) {
      // Abril, Septiembre (cambios de temporada)
      seasonalAdjustment *= 1.03
    }

    predictedAmount *= seasonalAdjustment

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

    // Añadir gastos recurrentes específicos
    const monthRecurringExpenses: RecurringExpense[] = []

    Object.values(recurringExpenses).forEach((expense) => {
      if (expense.frequency > 0) {
        // Verificar si alguna fecha cae en este mes
        const monthDates = expense.nextDates.filter((date) => getMonth(date) === monthNumber && getYear(date) === year)

        if (monthDates.length > 0) {
          // Añadir el gasto recurrente a la categoría correspondiente
          if (!predictedCategories[expense.category]) {
            predictedCategories[expense.category] = 0
          }

          // Añadir el gasto por cada ocurrencia
          monthDates.forEach((date) => {
            predictedCategories[expense.category] += expense.amount
            predictedAmount += expense.amount

            // Registrar para el análisis detallado
            monthRecurringExpenses.push({
              description: expense.description,
              category: expense.category,
              amount: expense.amount,
              date: date.toISOString(),
              confidence: expense.confidence,
            })
          })
        }
      }
    })

    // Calcular nivel de confianza
    let confidence = confidenceBase

    // Ajustar confianza según la distancia al presente
    confidence -= i * 0.05 // Menor confianza cuanto más lejos en el futuro

    // Ajustar confianza según la volatilidad
    confidence -= volatilityFactor * 0.1

    // Ajustar confianza según la cantidad de datos en ese mes específico
    const monthsWithSameNumber = monthNumbers.filter((m) => m === monthNumber).length
    if (monthsWithSameNumber >= 2) {
      confidence += 0.05 // Más confianza si tenemos datos históricos para ese mes
    }

    // Limitar la confianza entre 0.4 y 0.95
    confidence = Math.max(0.4, Math.min(0.95, confidence))

    // Determinar tendencia
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (slope > 0 && slope / (avgRecentMonthlyExpense || 1) > 0.05) {
      trend = "increasing"
    } else if (slope < 0 && Math.abs(slope) / (avgRecentMonthlyExpense || 1) > 0.05) {
      trend = "decreasing"
    }

    // Calcular riesgo de anomalías
    const anomalyRisk = volatilityFactor * 0.5 + (1 - confidence) * 0.5

    // Crear factores estacionales para la interfaz
    const seasonalFactorsForUI: Record<string, number> = {}
    Object.entries(seasonalFactors).forEach(([month, factor]) => {
      seasonalFactorsForUI[format(new Date(2023, Number.parseInt(month), 1), "MMMM")] = factor
    })

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
      categories: predictedCategories,
      confidence,
      trend,
      volatility: volatilityFactor,
      seasonalFactors: seasonalFactorsForUI,
      recurringExpenses: monthRecurringExpenses,
      anomalyRisk,
    })
  }

  return predictions
}

// Función mejorada para predecir ingresos futuros con análisis avanzado
export function predictIncome(transactions: Transaction[], months = 3): IncomePrediction[] {
  const currentDate = new Date()
  const predictions: IncomePrediction[] = []

  // Obtener datos de los últimos 24 meses
  const twoYearsAgo = subMonths(currentDate, 24)

  // Agrupar transacciones por mes
  const monthlyIncome: Record<string, number> = {}
  const monthlyIncomeBySource: Record<string, Record<string, number>> = {}
  const monthlyTransactionCounts: Record<string, number> = {}
  const dateObjects: Date[] = []

  // Inicializar arrays para análisis de tendencias
  const monthKeys: string[] = []
  const incomeValues: number[] = []
  const monthNumbers: number[] = [] // Para análisis de estacionalidad

  // Recopilar datos históricos
  transactions
    .filter((t) => t.type === "income" && isAfter(parseISO(t.date), twoYearsAgo))
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const monthKey = format(date, "MMM yyyy")
      const category = transaction.category
      const monthNumber = getMonth(date) // 0-11 para análisis de estacionalidad

      // Acumular ingresos mensuales
      if (!monthlyIncome[monthKey]) {
        monthlyIncome[monthKey] = 0
        monthlyIncomeBySource[monthKey] = {}
        monthlyTransactionCounts[monthKey] = 0
        monthKeys.push(monthKey)
        monthNumbers.push(monthNumber)
        dateObjects.push(startOfMonth(date))
      }

      monthlyIncome[monthKey] += transaction.amount
      monthlyTransactionCounts[monthKey]++

      // Acumular ingresos por fuente (categoría)
      if (!monthlyIncomeBySource[monthKey][category]) {
        monthlyIncomeBySource[monthKey][category] = 0
      }
      monthlyIncomeBySource[monthKey][category] += transaction.amount
    })

  // Ordenar meses cronológicamente
  const sortedMonthIndices = dateObjects
    .map((date, index) => ({ date, index }))
    .sort((a, b) => compareAsc(a.date, b.date))
    .map((item) => item.index)

  // Extraer valores de ingresos en orden cronológico
  sortedMonthIndices.forEach((index) => {
    incomeValues.push(monthlyIncome[monthKeys[index]])
  })

  // Detectar patrones de ingresos recurrentes
  const recurringIncome: Record<
    string,
    {
      description: string
      amount: number
      category: TransactionCategory
      frequency: number
      lastDate: Date
      nextDates: Date[]
      confidence: number
    }
  > = {}

  // Análisis de tendencia usando regresión lineal avanzada
  let slope = 0
  let intercept = 0
  const seasonalFactors: Record<number, number> = {}
  let confidenceBase = 0.75 // Confianza base para ingresos (suelen ser más predecibles)

  if (incomeValues.length >= 6) {
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

    // Calcular factores estacionales (por mes del año)
    const monthFactors: Record<number, { sum: number; count: number }> = {}

    sortedMonthIndices.forEach((index, i) => {
      const date = dateObjects[index]
      const month = getMonth(date)
      if (!monthFactors[month]) {
        monthFactors[month] = { sum: 0, count: 0 }
      }

      // Eliminar la tendencia para calcular el factor estacional
      const expectedValue = intercept + slope * i
      const seasonalComponent = incomeValues[i] / (expectedValue || 1)

      monthFactors[month].sum += seasonalComponent
      monthFactors[month].count += 1
    })

    // Calcular el promedio de los factores estacionales
    Object.keys(monthFactors).forEach((month) => {
      const m = Number.parseInt(month)
      seasonalFactors[m] = monthFactors[m].sum / monthFactors[m].count
    })

    // Ajustar confianza según la cantidad de datos
    if (incomeValues.length >= 12) {
      confidenceBase = 0.9 // Más datos, mayor confianza
    }
  } else {
    // Pocos datos, menor confianza
    confidenceBase = 0.65
  }

  // Identificar ingresos recurrentes con análisis avanzado
  const incomeTransactions = transactions
    .filter((t) => t.type === "income" && isAfter(parseISO(t.date), subMonths(currentDate, 12)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

  // Agrupar transacciones similares
  const transactionGroups: Record<string, Transaction[]> = {}

  incomeTransactions.forEach((transaction) => {
    // Crear una clave basada en descripción y categoría
    const key = `${transaction.description.toLowerCase().trim()}-${transaction.category}`

    if (!transactionGroups[key]) {
      transactionGroups[key] = []
    }

    transactionGroups[key].push(transaction)
  })

  // Analizar cada grupo para detectar patrones recurrentes
  Object.entries(transactionGroups).forEach(([key, transactions]) => {
    if (transactions.length < 2) return // Necesitamos al menos 2 transacciones para detectar un patrón

    const dates = transactions.map((t) => parseISO(t.date)).sort(compareAsc)
    const amounts = transactions.map((t) => t.amount)
    const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length

    // Calcular intervalos entre fechas
    const intervals: number[] = []
    for (let i = 1; i < dates.length; i++) {
      intervals.push(differenceInDays(dates[i], dates[i - 1]))
    }

    // Calcular el intervalo promedio y la desviación estándar
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
    const stdDevInterval = Math.sqrt(
      intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length,
    )

    // Determinar si es un patrón recurrente basado en la consistencia de los intervalos
    const isRecurring = stdDevInterval / avgInterval < 0.3 // Menos del 30% de variación

    if (isRecurring) {
      let frequency = Math.round(avgInterval)
      let confidenceScore = 0.7

      // Ajustar confianza basada en la consistencia y número de ocurrencias
      confidenceScore += (1 - stdDevInterval / avgInterval) * 0.2 // Más consistente = mayor confianza
      confidenceScore += Math.min((transactions.length - 2) * 0.05, 0.2) // Más ocurrencias = mayor confianza

      // Limitar confianza a 0.95
      confidenceScore = Math.min(confidenceScore, 0.95)

      // Detectar patrones comunes para mejorar la predicción
      if (Math.abs(frequency - 30) <= 3) {
        frequency = 30 // Mensual
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 14) <= 2) {
        frequency = 14 // Quincenal
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 7) <= 1) {
        frequency = 7 // Semanal
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 90) <= 5) {
        frequency = 90 // Trimestral
        confidenceScore += 0.05
      } else if (Math.abs(frequency - 365) <= 10) {
        frequency = 365 // Anual
        confidenceScore += 0.05
      }

      // Registrar el ingreso recurrente
      recurringIncome[key] = {
        description: transactions[0].description,
        amount: avgAmount,
        category: transactions[0].category,
        frequency,
        lastDate: dates[dates.length - 1],
        nextDates: [],
        confidence: confidenceScore,
      }

      // Calcular próximas fechas
      const lastDate = dates[dates.length - 1]
      for (let i = 1; i <= 6; i++) {
        const nextDate = addDays(lastDate, frequency * i)
        if (isAfter(nextDate, currentDate) && isBefore(nextDate, addMonths(currentDate, months))) {
          recurringIncome[key].nextDates.push(nextDate)
        }
      }
    }
  })

  // Calcular el promedio de ingresos mensuales recientes (últimos 3 meses)
  const recentMonths = sortedMonthIndices.slice(-3).map((index) => monthKeys[index])
  const avgRecentMonthlyIncome =
    recentMonths.length > 0 ? recentMonths.reduce((sum, key) => sum + monthlyIncome[key], 0) / recentMonths.length : 0

  // Calcular la desviación estándar para evaluar la volatilidad
  const calculateStdDev = (values: number[]): number => {
    if (values.length < 2) return 0
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length)
  }

  const stdDev = calculateStdDev(incomeValues)
  const volatilityFactor = stdDev / (avgRecentMonthlyIncome || 1)

  // Generar predicciones para los próximos meses
  for (let i = 1; i <= months; i++) {
    const futureMonth = addMonths(currentDate, i)
    const monthKey = format(futureMonth, "MMM yyyy")
    const monthNumber = getMonth(futureMonth)
    const year = getYear(futureMonth)
    const monthName = format(futureMonth, "MMMM")

    // Base de predicción: promedio reciente + tendencia
    let predictedAmount = avgRecentMonthlyIncome + slope * i

    // Si tenemos suficientes datos, usar el modelo completo
    if (incomeValues.length >= 6) {
      predictedAmount = intercept + slope * (incomeValues.length + i - 1)
    }

    // Aplicar factor estacional si está disponible
    const seasonalFactor = seasonalFactors[monthNumber] || 1
    predictedAmount *= seasonalFactor

    // Ajustes estacionales adicionales basados en patrones comunes
    const month = monthNumber + 1 // 1-12 para legibilidad
    let seasonalAdjustment = 1

    if (month === 12) {
      // Diciembre (bonos de fin de año)
      seasonalAdjustment *= 1.1
    } else if (month === 1) {
      // Enero
      seasonalAdjustment *= 0.95
    } else if ([6, 7].includes(month)) {
      // Junio, Julio (vacaciones)
      seasonalAdjustment *= 1.05
    }

    predictedAmount *= seasonalAdjustment

    // Análisis de fuentes para predicciones más precisas
    const predictedSources: Record<string, number> = {}

    // Distribuir el monto predicho entre fuentes basado en patrones históricos
    if (recentMonths.length > 0) {
      const sourceDistribution: Record<string, number> = {}
      let totalIncome = 0

      // Calcular la distribución promedio de fuentes en los meses recientes
      recentMonths.forEach((month) => {
        const sources = monthlyIncomeBySource[month] || {}
        Object.entries(sources).forEach(([category, amount]) => {
          if (!sourceDistribution[category]) sourceDistribution[category] = 0
          sourceDistribution[category] += amount
          totalIncome += amount
        })
      })

      // Normalizar la distribución
      if (totalIncome > 0) {
        Object.keys(sourceDistribution).forEach((category) => {
          sourceDistribution[category] /= totalIncome
        })
      }

      // Aplicar la distribución a la predicción
      Object.entries(sourceDistribution).forEach(([category, ratio]) => {
        predictedSources[category] = predictedAmount * ratio
      })
    }

    // Añadir ingresos recurrentes específicos
    const monthRecurringIncome: RecurringIncome[] = []

    Object.values(recurringIncome).forEach((income) => {
      if (income.frequency > 0) {
        // Verificar si alguna fecha cae en este mes
        const monthDates = income.nextDates.filter((date) => getMonth(date) === monthNumber && getYear(date) === year)

        if (monthDates.length > 0) {
          // Añadir el ingreso recurrente a la categoría correspondiente
          if (!predictedSources[income.category]) {
            predictedSources[income.category] = 0
          }

          // Añadir el ingreso por cada ocurrencia
          monthDates.forEach((date) => {
            predictedSources[income.category] += income.amount
            predictedAmount += income.amount

            // Registrar para el análisis detallado
            monthRecurringIncome.push({
              description: income.description,
              category: income.category,
              amount: income.amount,
              date: date.toISOString(),
              confidence: income.confidence,
            })
          })
        }
      }
    })

    // Calcular nivel de confianza
    let confidence = confidenceBase

    // Ajustar confianza según la distancia al presente
    confidence -= i * 0.05 // Menor confianza cuanto más lejos en el futuro

    // Ajustar confianza según la volatilidad
    confidence -= volatilityFactor * 0.1

    // Ajustar confianza según la cantidad de datos en ese mes específico
    const monthsWithSameNumber = monthNumbers.filter((m) => m === monthNumber).length
    if (monthsWithSameNumber >= 2) {
      confidence += 0.05 // Más confianza si tenemos datos históricos para ese mes
    }

    // Limitar la confianza entre 0.4 y 0.95
    confidence = Math.max(0.4, Math.min(0.95, confidence))

    // Determinar tendencia
    let trend: "increasing" | "decreasing" | "stable" = "stable"
    if (slope > 0 && slope / (avgRecentMonthlyIncome || 1) > 0.05) {
      trend = "increasing"
    } else if (slope < 0 && Math.abs(slope) / (avgRecentMonthlyIncome || 1) > 0.05) {
      trend = "decreasing"
    }

    // Crear factores estacionales para la interfaz
    const seasonalFactorsForUI: Record<string, number> = {}
    Object.entries(seasonalFactors).forEach(([month, factor]) => {
      seasonalFactorsForUI[format(new Date(2023, Number.parseInt(month), 1), "MMMM")] = factor
    })

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
      sources: predictedSources,
      confidence,
      trend,
      volatility: volatilityFactor,
      seasonalFactors: seasonalFactorsForUI,
      recurringIncome: monthRecurringIncome,
    })
  }

  return predictions
}

// Función mejorada para identificar categorías de gastos anómalos con análisis avanzado
export function identifyAnomalousSpending(transactions: Transaction[]): {
  category: string
  amount: number
  percentageIncrease: number
  averageAmount: number
  description: string
  severity: "high" | "medium" | "low"
  transactions: Transaction[]
  anomalyScore: number
  impactOnBudget: number
}[] {
  const currentDate = new Date()
  const currentMonth = startOfMonth(currentDate)
  const lastMonth = startOfMonth(subMonths(currentDate, 1))
  const threeMonthsAgo = startOfMonth(subMonths(currentDate, 3))
  const sixMonthsAgo = startOfMonth(subMonths(currentDate, 6))

  // Agrupar gastos por categoría para diferentes períodos
  const currentMonthExpenses: Record<string, number> = {}
  const lastMonthExpenses: Record<string, number> = {}
  const historicalExpenses: Record<string, number[]> = {}
  const transactionCounts: Record<string, number> = {}
  const categoryTransactions: Record<string, Transaction[]> = {}

  // Total de gastos para calcular impacto en el presupuesto
  let totalCurrentMonthExpenses = 0

  transactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const date = parseISO(transaction.date)
      const category = transaction.category

      // Inicializar arrays si es necesario
      if (!historicalExpenses[category]) {
        historicalExpenses[category] = []
        transactionCounts[category] = 0
        categoryTransactions[category] = []
      }

      // Incrementar contador de transacciones para esta categoría
      transactionCounts[category]++

      // Guardar transacciones por categoría para el mes actual
      if (isSameMonth(date, currentMonth)) {
        categoryTransactions[category].push(transaction)
        totalCurrentMonthExpenses += transaction.amount
      }

      // Agrupar por período
      if (isSameMonth(date, currentMonth)) {
        if (!currentMonthExpenses[category]) currentMonthExpenses[category] = 0
        currentMonthExpenses[category] += transaction.amount
      } else if (isSameMonth(date, lastMonth)) {
        if (!lastMonthExpenses[category]) lastMonthExpenses[category] = 0
        lastMonthExpenses[category] += transaction.amount
      }

      // Recopilar datos históricos (últimos 6 meses, excluyendo el mes actual)
      if (isAfter(date, sixMonthsAgo) && !isSameMonth(date, currentMonth)) {
        historicalExpenses[category].push(transaction.amount)
      }
    })

  // Calcular promedios históricos y desviaciones estándar
  const categoryStats: Record<
    string,
    {
      avg: number
      stdDev: number
      trend: number
      volatility: number
    }
  > = {}

  Object.entries(historicalExpenses).forEach(([category, amounts]) => {
    if (amounts.length > 0) {
      const sum = amounts.reduce((acc, val) => acc + val, 0)
      const avg = sum / amounts.length

      // Calcular desviación estándar
      const squaredDiffs = amounts.map((val) => Math.pow(val - avg, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / amounts.length
      const stdDev = Math.sqrt(variance)

      // Calcular tendencia (pendiente de la línea de regresión)
      let trend = 0
      if (amounts.length >= 3) {
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumX2 = 0
        const n = amounts.length

        for (let i = 0; i < n; i++) {
          sumX += i
          sumY += amounts[i]
          sumXY += i * amounts[i]
          sumX2 += i * i
        }

        trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
      }

      // Calcular volatilidad (coeficiente de variación)
      const volatility = avg > 0 ? stdDev / avg : 0

      categoryStats[category] = { avg, stdDev, trend, volatility }
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
      let severity: "high" | "medium" | "low" = "low"
      let anomalyScore = 0

      // Calcular aumento porcentual respecto al mes anterior
      if (lastMonthAmount > 0) {
        percentageIncrease = ((amount - lastMonthAmount) / lastMonthAmount) * 100
        if (percentageIncrease >= 30) {
          isAnomaly = true
          anomalyScore += percentageIncrease / 100

          // Determinar severidad basada en el porcentaje de aumento
          if (percentageIncrease >= 100) {
            severity = "high"
            anomalyScore += 0.5
          } else if (percentageIncrease >= 50) {
            severity = "medium"
            anomalyScore += 0.3
          }
        }
      }

      // Verificar si está fuera del rango normal
      if (!isAnomaly) {
        const zScore = (amount - stats.avg) / (stats.stdDev || 1)
        if (zScore > 2) {
          isAnomaly = true
          percentageIncrease = ((amount - stats.avg) / stats.avg) * 100
          anomalyScore += zScore / 5

          // Determinar severidad basada en el z-score
          if (zScore > 3) {
            severity = "high"
            anomalyScore += 0.5
          } else if (zScore > 2.5) {
            severity = "medium"
            anomalyScore += 0.3
          }
        }
      }

      // Considerar la tendencia y volatilidad
      if (!isAnomaly && stats.trend > 0) {
        // Si hay una tendencia al alza y la volatilidad es baja, podría ser una anomalía
        const expectedAmount = stats.avg + stats.trend * 3 // Proyección basada en la tendencia
        if (amount > expectedAmount * 1.3 && stats.volatility < 0.3) {
          isAnomaly = true
          percentageIncrease = ((amount - expectedAmount) / expectedAmount) * 100
          severity = "low"
          anomalyScore += 0.2
        }
      }

      // Considerar la volatilidad histórica
      anomalyScore += stats.volatility * 0.5

      // Normalizar el score de anomalía entre 0 y 1
      anomalyScore = Math.min(1, anomalyScore)

      // Calcular impacto en el presupuesto
      const impactOnBudget = totalCurrentMonthExpenses > 0 ? amount / totalCurrentMonthExpenses : 0

      if (isAnomaly) {
        // Generar descripción personalizada
        let description = ""

        if (severity === "high") {
          description = `Gasto extremadamente alto en comparación con patrones anteriores. Considere revisar esta categoría inmediatamente.`
        } else if (severity === "medium") {
          description = `Aumento significativo respecto a los gastos habituales. Podría ser necesario ajustar su presupuesto.`
        } else {
          description = `Gasto superior al promedio histórico. Mantenga esta categoría bajo observación.`
        }

        anomalies.push({
          category,
          amount,
          percentageIncrease,
          averageAmount: stats.avg,
          description,
          severity,
          transactions: categoryTransactions[category] || [],
          anomalyScore,
          impactOnBudget,
        })
      }
    }
  }

  // Ordenar por severidad y luego por porcentaje de aumento
  return anomalies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.anomalyScore - a.anomalyScore
  })
}

// Función mejorada para sugerir metas de ahorro con análisis avanzado
export function suggestSavingsGoals(transactions: Transaction[]): {
  amount: number
  description: string
  potentialSavings: { category: string; amount: number; suggestion: string; impact: number }[]
  savingsRate: number
  timeToGoal: { months: number; amount: number; description: string }[]
  confidence: number
  scenarios: { name: string; savingsRate: number; monthsToEmergencyFund: number; description: string }[]
} {
  // Obtener predicciones para los próximos meses
  const monthlyIncome = predictIncome(transactions, 3)
  const monthlyExpenses = predictExpenses(transactions, 3)

  // Calcular promedio de ingresos y gastos previstos
  const avgPredictedIncome = monthlyIncome.reduce((sum, month) => sum + month.amount, 0) / monthlyIncome.length
  const avgPredictedExpenses = monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / monthlyExpenses.length

  const availableForSavings = avgPredictedIncome - avgPredictedExpenses
  const savingsRate = avgPredictedIncome > 0 ? (availableForSavings / avgPredictedIncome) * 100 : 0

  // Analizar gastos por categoría para identificar áreas de ahorro potencial
  const currentDate = new Date()
  const threeMonthsAgo = subMonths(currentDate, 3)

  const categoryExpenses: Record<string, number[]> = {}
  const categoryTotals: Record<string, number> = {}
  const categoryTransactionCounts: Record<string, number> = {}

  transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), threeMonthsAgo))
    .forEach((transaction) => {
      const category = transaction.category
      if (!categoryExpenses[category]) {
        categoryExpenses[category] = []
        categoryTotals[category] = 0
        categoryTransactionCounts[category] = 0
      }
      categoryExpenses[category].push(transaction.amount)
      categoryTotals[category] += transaction.amount
      categoryTransactionCounts[category]++
    })

  // Identificar categorías con potencial de ahorro
  const potentialSavings: { category: string; amount: number; suggestion: string; priority: number; impact: number }[] =
    []

  Object.entries(categoryExpenses).forEach(([category, amounts]) => {
    if (amounts.length >= 3) {
      const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0)
      const avgMonthlySpent = totalSpent / amounts.length
      const transactionFrequency = categoryTransactionCounts[category] / amounts.length

      // Diferentes estrategias según la categoría
      let savingsPotential = 0
      let suggestion = ""
      let priority = 2 // Prioridad media por defecto

      switch (category) {
        case "food":
          // Mayor potencial de ahorro si hay muchas transacciones (comidas fuera)
          const savingsRate = transactionFrequency > 15 ? 0.25 : 0.15
          savingsPotential = avgMonthlySpent * savingsRate
          suggestion =
            transactionFrequency > 15
              ? "Reducir comidas fuera de casa podría ahorrar significativamente. Considere preparar más comidas en casa."
              : "Considere planificar sus compras de alimentos y usar cupones de descuento."
          priority = transactionFrequency > 15 ? 1 : 2
          break
        case "entertainment":
          savingsPotential = avgMonthlySpent * 0.3
          suggestion =
            "Busque alternativas gratuitas o de menor costo para entretenimiento. Considere compartir suscripciones."
          priority = 2
          break
        case "shopping":
          savingsPotential = avgMonthlySpent * 0.25
          suggestion = "Espere a las rebajas para compras no esenciales y compare precios antes de comprar."
          priority = 1
          break
        case "transportation":
          savingsPotential = avgMonthlySpent * 0.15
          suggestion =
            "Considere opciones de transporte público, compartir viajes o combinar trayectos para ahorrar combustible."
          priority = 2
          break
        case "utilities":
          savingsPotential = avgMonthlySpent * 0.1
          suggestion = "Revise sus planes de servicios, busque opciones más económicas y reduzca el consumo energético."
          priority = 3
          break
        case "personal":
          savingsPotential = avgMonthlySpent * 0.2
          suggestion =
            "Busque alternativas más económicas para cuidado personal y considere espaciar ciertos servicios."
          priority = 2
          break
        default:
          // Para otras categorías, sugerir un ahorro modesto
          savingsPotential = avgMonthlySpent * 0.1
          suggestion = "Revise sus gastos en esta categoría para identificar posibles ahorros."
          priority = 3
      }

      // Calcular impacto del ahorro
      const impact = avgPredictedExpenses > 0 ? savingsPotential / avgPredictedExpenses : 0

      if (savingsPotential >= 10) {
        // Solo sugerir si el ahorro es significativo
        potentialSavings.push({
          category,
          amount: savingsPotential,
          suggestion,
          priority,
          impact,
        })
      }
    }
  })

  // Ordenar por prioridad y potencial de ahorro
  potentialSavings.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    return b.amount - a.amount
  })

  // Calcular metas de ahorro para diferentes plazos
  const timeToGoal = []

  // Fondos de emergencia (3-6 meses de gastos)
  const monthlyExpensesAvg = avgPredictedExpenses
  const emergencyFund3Months = monthlyExpensesAvg * 3
  const emergencyFund6Months = monthlyExpensesAvg * 6

  // Calcular tiempo para alcanzar las metas
  const potentialMonthlySavings =
    availableForSavings + potentialSavings.slice(0, 3).reduce((sum, item) => sum + item.amount, 0) * 0.7

  if (potentialMonthlySavings > 0) {
    const monthsToEmergency3 = Math.ceil(emergencyFund3Months / potentialMonthlySavings)
    const monthsToEmergency6 = Math.ceil(emergencyFund6Months / potentialMonthlySavings)

    timeToGoal.push({
      months: monthsToEmergency3,
      amount: emergencyFund3Months,
      description: "Fondo de emergencia básico (3 meses de gastos)",
    })

    timeToGoal.push({
      months: monthsToEmergency6,
      amount: emergencyFund6Months,
      description: "Fondo de emergencia completo (6 meses de gastos)",
    })
  }

  // Generar escenarios de ahorro
  const scenarios = []

  // Escenario 1: Conservador (mantener gastos actuales)
  const conservativeSavingsRate = savingsRate
  const conservativeMonthsToEmergency =
    potentialMonthlySavings > 0 ? Math.ceil(emergencyFund3Months / potentialMonthlySavings) : Number.POSITIVE_INFINITY

  scenarios.push({
    name: "Conservador",
    savingsRate: conservativeSavingsRate,
    monthsToEmergencyFund: conservativeMonthsToEmergency,
    description: "Mantener sus hábitos de gasto actuales.",
  })

  // Escenario 2: Moderado (implementar algunas sugerencias de ahorro)
  const moderateSavings =
    availableForSavings + potentialSavings.slice(0, 2).reduce((sum, item) => sum + item.amount, 0) * 0.5
  const moderateSavingsRate = avgPredictedIncome > 0 ? (moderateSavings / avgPredictedIncome) * 100 : 0
  const moderateMonthsToEmergency =
    moderateSavings > 0 ? Math.ceil(emergencyFund3Months / moderateSavings) : Number.POSITIVE_INFINITY

  scenarios.push({
    name: "Moderado",
    savingsRate: moderateSavingsRate,
    monthsToEmergencyFund: moderateMonthsToEmergency,
    description: "Implementar algunas sugerencias de ahorro en las categorías principales.",
  })

  // Escenario 3: Agresivo (implementar todas las sugerencias de ahorro)
  const aggressiveSavings = availableForSavings + potentialSavings.reduce((sum, item) => sum + item.amount, 0) * 0.8
  const aggressiveSavingsRate = avgPredictedIncome > 0 ? (aggressiveSavings / avgPredictedIncome) * 100 : 0
  const aggressiveMonthsToEmergency =
    aggressiveSavings > 0 ? Math.ceil(emergencyFund3Months / aggressiveSavings) : Number.POSITIVE_INFINITY

  scenarios.push({
    name: "Agresivo",
    savingsRate: aggressiveSavingsRate,
    monthsToEmergencyFund: aggressiveMonthsToEmergency,
    description: "Implementar todas las sugerencias de ahorro y reducir gastos no esenciales al mínimo.",
  })

  // Calcular meta de ahorro recomendada
  let suggestedSavings = 0
  let description = ""
  let confidence = 0.7 // Confianza base

  if (availableForSavings <= 0) {
    // Si no hay fondos disponibles, sugerir ahorros basados en recortes potenciales
    const totalPotentialSavings = potentialSavings.reduce((sum, item) => sum + item.amount, 0)
    suggestedSavings = totalPotentialSavings * 0.7 // 70% de los ahorros potenciales identificados

    description = `Basado en sus patrones de gasto, podría ahorrar aproximadamente ${Math.round(suggestedSavings)} al mes haciendo algunos ajustes en sus gastos. Revise las sugerencias específicas por categoría para maximizar sus ahorros.`
    confidence = 0.65 // Menor confianza cuando se basa solo en recortes
  } else {
    // Si hay fondos disponibles, sugerir un porcentaje de ellos
    const targetSavingsRate = 0.2 // Meta: ahorrar 20% de los ingresos

    if (savingsRate >= targetSavingsRate * 100) {
      // Ya está ahorrando suficiente
      suggestedSavings = availableForSavings
      description = `¡Excelente! Ya está ahorrando un ${savingsRate.toFixed(1)}% de sus ingresos, lo cual es una tasa saludable. Puede mantener su meta actual de ahorro o considerar aumentarla para alcanzar sus objetivos financieros más rápido.`
      confidence = 0.85 // Alta confianza cuando ya tiene buenos hábitos
    } else {
      // Necesita aumentar su tasa de ahorro
      const idealSavings = avgPredictedIncome * targetSavingsRate
      suggestedSavings = Math.min(
        idealSavings,
        availableForSavings + potentialSavings.reduce((sum, item) => sum + item.amount, 0) * 0.5,
      )

      description = `Le recomendamos ahorrar aproximadamente ${Math.round(suggestedSavings)} por mes, lo que representaría un ${((suggestedSavings / avgPredictedIncome) * 100).toFixed(1)}% de sus ingresos. Esto le ayudará a construir un fondo de emergencia y alcanzar sus metas financieras a largo plazo.`
      confidence = 0.75 // Confianza media cuando hay que mejorar
    }
  }

  // Ajustar confianza según la cantidad de datos
  if (transactions.length < 10) {
    confidence *= 0.8 // Reducir confianza si hay pocos datos
  } else if (transactions.length > 50) {
    confidence = Math.min(0.95, confidence * 1.1) // Aumentar confianza si hay muchos datos
  }

  return {
    amount: Math.round(suggestedSavings),
    description,
    potentialSavings: potentialSavings.slice(0, 3).map(({ category, amount, suggestion, impact }) => ({
      category,
      amount,
      suggestion,
      impact,
    })),
    savingsRate,
    timeToGoal,
    confidence,
    scenarios,
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
    transfer: {
      terms: ["transfer", "move", "send", "receive", "wire", "zelle", "venmo", "paypal", "cash app"],
      weights: [1, 0.8, 0.8, 0.8, 0.9, 0.9, 0.9, 0.9, 0.9],
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
  savingsOpportunities: { description: string; potentialSavings: number; difficulty: "easy" | "medium" | "hard" }[]
  anomalies: { description: string; severity: "high" | "medium" | "low"; category: string; amount: number }[]
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
  let totalRecentIncome = 0

  recentTransactions
    .filter((t) => t.type === "expense")
    .forEach((transaction) => {
      const category = transaction.category
      if (!recentExpensesByCategory[category]) recentExpensesByCategory[category] = 0
      recentExpensesByCategory[category] += transaction.amount
      totalRecentExpenses += transaction.amount
    })

  recentTransactions
    .filter((t) => t.type === "income")
    .forEach((transaction) => {
      totalRecentIncome += transaction.amount
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

  // Identificar oportunidades de ahorro
  const savingsOpportunities: {
    description: string
    potentialSavings: number
    difficulty: "easy" | "medium" | "hard"
  }[] = []

  // Comidas fuera de casa
  const foodExpenses = recentExpensesByCategory["food"] || 0
  if (foodExpenses > 200) {
    savingsOpportunities.push({
      description: "Reducir comidas fuera de casa y preparar más comidas en el hogar",
      potentialSavings: foodExpenses * 0.3,
      difficulty: "medium",
    })
  }

  // Entretenimiento
  const entertainmentExpenses = recentExpensesByCategory["entertainment"] || 0
  if (entertainmentExpenses > 100) {
    savingsOpportunities.push({
      description: "Buscar alternativas gratuitas o de menor costo para entretenimiento",
      potentialSavings: entertainmentExpenses * 0.4,
      difficulty: "easy",
    })
  }

  // Compras
  const shoppingExpenses = recentExpensesByCategory["shopping"] || 0
  if (shoppingExpenses > 200) {
    savingsOpportunities.push({
      description: "Posponer compras no esenciales y aprovechar rebajas",
      potentialSavings: shoppingExpenses * 0.25,
      difficulty: "medium",
    })
  }

  // Transporte
  const transportationExpenses = recentExpensesByCategory["transportation"] || 0
  if (transportationExpenses > 150) {
    savingsOpportunities.push({
      description: "Considerar opciones de transporte público o compartir viajes",
      potentialSavings: transportationExpenses * 0.2,
      difficulty: "hard",
    })
  }

  // Servicios
  const utilitiesExpenses = recentExpensesByCategory["utilities"] || 0
  if (utilitiesExpenses > 200) {
    savingsOpportunities.push({
      description: "Revisar planes de servicios y reducir consumo energético",
      potentialSavings: utilitiesExpenses * 0.15,
      difficulty: "medium",
    })
  }

  // Ordenar por potencial de ahorro
  savingsOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings)

  // Identificar anomalías
  const anomalies: { description: string; severity: "high" | "medium" | "low"; category: string; amount: number }[] = []

  // Detectar categorías con gastos inusualmente altos
  Object.entries(recentExpensesByCategory).forEach(([category, amount]) => {
    const olderAmount = olderExpensesByCategory[category] || 0

    if (olderAmount > 0) {
      const changePercentage = ((amount - olderAmount) / olderAmount) * 100

      if (changePercentage > 80 && amount > 100) {
        let severity: "high" | "medium" | "low" = "low"

        if (changePercentage > 150) {
          severity = "high"
        } else if (changePercentage > 100) {
          severity = "medium"
        }

        anomalies.push({
          description: `Gasto inusualmente alto en ${category}`,
          severity,
          category,
          amount,
        })
      }
    }
  })

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
  if (totalRecentIncome > 0) {
    const savingsRate = ((totalRecentIncome - totalRecentExpenses) / totalRecentIncome) * 100

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

  // Insight sobre oportunidades de ahorro
  if (savingsOpportunities.length > 0) {
    const totalPotentialSavings = savingsOpportunities.reduce(
      (sum, opportunity) => sum + opportunity.potentialSavings,
      0,
    )
    insights.push(
      `Podrías ahorrar hasta ${totalPotentialSavings.toFixed(0)} implementando cambios en tus hábitos de gasto.`,
    )
  }

  return {
    insights,
    spendingTrends,
    topExpenseCategories,
    savingsOpportunities: savingsOpportunities.slice(0, 3),
    anomalies,
  }
}
