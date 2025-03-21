import type { Transaction } from "@/types/finance"
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
  getDate,
} from "date-fns"

// Función mejorada para predecir gastos futuros con análisis avanzado
export function predictExpenses(
  transactions: Transaction[],
  months = 3,
): {
  month: string
  amount: number
  categories: Record<string, number>
  confidence: number
}[] {
  const currentDate = new Date()
  const predictions = []

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
  monthKeys.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  // Extraer valores de gastos en orden cronológico
  monthKeys.forEach((key) => {
    expenseValues.push(monthlyExpenses[key])
  })

  // Análisis de tendencia usando regresión lineal avanzada
  let slope = 0
  let intercept = 0
  const seasonalFactors: Record<number, number> = {}
  let confidenceBase = 0.7 // Confianza base

  if (expenseValues.length >= 6) {
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
    intercept = (sumY - slope * sumX) / n

    // Calcular factores estacionales (por mes del año)
    const monthFactors: Record<number, { sum: number; count: number }> = {}

    monthKeys.forEach((monthKey, i) => {
      const date = new Date(monthKey)
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
  const recentMonths = monthKeys.slice(-3)
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
      amount: number
      category: string
      frequency: number
      lastDate: Date
      nextDates: Date[]
    }
  > = {}

  // Identificar gastos recurrentes
  transactions
    .filter((t) => t.type === "expense" && isAfter(parseISO(t.date), subMonths(currentDate, 6)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .forEach((transaction) => {
      // Buscar transacciones similares (misma descripción, categoría y monto similar)
      const key = `${transaction.description}-${transaction.category}`
      const date = parseISO(transaction.date)

      if (!recurringExpenses[key]) {
        recurringExpenses[key] = {
          amount: transaction.amount,
          category: transaction.category,
          frequency: 0,
          lastDate: date,
          nextDates: [],
        }
      } else {
        // Calcular la frecuencia como la diferencia en días
        const daysDiff = differenceInDays(date, recurringExpenses[key].lastDate)

        // Si la diferencia es entre 25 y 35 días, probablemente es mensual
        if (daysDiff >= 25 && daysDiff <= 35) {
          recurringExpenses[key].frequency = 30 // Mensual
        }
        // Si la diferencia es entre 6 y 8 días, probablemente es semanal
        else if (daysDiff >= 6 && daysDiff <= 8) {
          recurringExpenses[key].frequency = 7 // Semanal
        }
        // Si la diferencia es entre 13 y 15 días, probablemente es quincenal
        else if (daysDiff >= 13 && daysDiff <= 15) {
          recurringExpenses[key].frequency = 14 // Quincenal
        }
        // Si la diferencia es entre 85 y 95 días, probablemente es trimestral
        else if (daysDiff >= 85 && daysDiff <= 95) {
          recurringExpenses[key].frequency = 90 // Trimestral
        }

        recurringExpenses[key].lastDate = date
        recurringExpenses[key].amount = recurringExpenses[key].amount * 0.7 + transaction.amount * 0.3 // Actualizar monto promedio
      }
    })

  // Calcular próximas fechas para gastos recurrentes
  Object.values(recurringExpenses).forEach((expense) => {
    if (expense.frequency > 0) {
      // Calcular las próximas 3 fechas
      for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(expense.lastDate)
        nextDate.setDate(nextDate.getDate() + expense.frequency * i)
        expense.nextDates.push(nextDate)
      }
    }
  })

  // Generar predicciones para los próximos meses
  for (let i = 1; i <= months; i++) {
    const futureMonth = addMonths(currentDate, i)
    const monthKey = format(futureMonth, "MMM yyyy")
    const monthNumber = getMonth(futureMonth)
    const year = getYear(futureMonth)

    // Base de predicción: promedio reciente + tendencia
    let predictedAmount = avgRecentMonthlyExpense + slope * (expenseValues.length + i - 1)

    // Si tenemos suficientes datos, usar el modelo completo
    if (expenseValues.length >= 6) {
      predictedAmount = intercept + slope * (expenseValues.length + i - 1)
    }

    // Aplicar factor estacional si está disponible
    if (seasonalFactors[monthNumber]) {
      predictedAmount *= seasonalFactors[monthNumber]
    } else {
      // Ajustes estacionales genéricos si no hay datos históricos suficientes
      const month = monthNumber + 1 // 1-12 para legibilidad

      if (month === 12) {
        // Diciembre
        predictedAmount *= 1.25 // 25% más de gastos en diciembre (navidad)
      } else if (month === 1) {
        // Enero
        predictedAmount *= 0.85 // 15% menos de gastos en enero (post-navidad)
      } else if ([6, 7, 8].includes(month)) {
        // Verano
        predictedAmount *= 1.1 // 10% más en verano
      } else if ([4, 9].includes(month)) {
        // Abril, Septiembre (cambios de temporada)
        predictedAmount *= 1.05 // 5% más
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

    // Añadir gastos recurrentes específicos
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
          monthDates.forEach(() => {
            predictedCategories[expense.category] += expense.amount
            predictedAmount += expense.amount
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

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
      categories: predictedCategories,
      confidence,
    })
  }

  return predictions
}

// Función mejorada para predecir ingresos futuros con análisis avanzado
export function predictIncome(
  transactions: Transaction[],
  months = 3,
): {
  month: string
  amount: number
  sources: Record<string, number>
  confidence: number
}[] {
  const currentDate = new Date()
  const predictions = []

  // Obtener datos de los últimos 24 meses
  const twoYearsAgo = subMonths(currentDate, 24)

  // Agrupar transacciones por mes
  const monthlyIncome: Record<string, number> = {}
  const monthlyIncomeBySource: Record<string, Record<string, number>> = {}
  const monthlyTransactionCounts: Record<string, number> = {}

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
  monthKeys.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime()
  })

  // Extraer valores de ingresos en orden cronológico
  monthKeys.forEach((key) => {
    incomeValues.push(monthlyIncome[key])
  })

  // Detectar patrones de ingresos recurrentes
  const recurringIncome: Record<
    string,
    {
      amount: number
      category: string
      frequency: number
      lastDate: Date
      nextDates: Date[]
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

    monthKeys.forEach((monthKey, i) => {
      const date = new Date(monthKey)
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

  // Analizar transacciones para identificar ingresos recurrentes
  transactions
    .filter((t) => t.type === "income" && isAfter(parseISO(t.date), subMonths(currentDate, 12)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .forEach((transaction) => {
      const key = `${transaction.description}-${transaction.category}`
      const date = parseISO(transaction.date)

      if (!recurringIncome[key]) {
        recurringIncome[key] = {
          amount: transaction.amount,
          category: transaction.category,
          frequency: 0,
          lastDate: date,
          nextDates: [],
        }
      } else {
        // Calcular la frecuencia como la diferencia en días
        const daysDiff = differenceInDays(date, recurringIncome[key].lastDate)

        // Si la diferencia es entre 25 y 35 días, probablemente es mensual (salario)
        if (daysDiff >= 25 && daysDiff <= 35) {
          recurringIncome[key].frequency = 30 // Mensual
        }
        // Si la diferencia es entre 13 y 16 días, probablemente es quincenal
        else if (daysDiff >= 13 && daysDiff <= 16) {
          recurringIncome[key].frequency = 15 // Quincenal
        }
        // Si la diferencia es entre 6 y 8 días, probablemente es semanal
        else if (daysDiff >= 6 && daysDiff <= 8) {
          recurringIncome[key].frequency = 7 // Semanal
        }
        // Si la diferencia es entre 85 y 95 días, probablemente es trimestral
        else if (daysDiff >= 85 && daysDiff <= 95) {
          recurringIncome[key].frequency = 90 // Trimestral
        }
        // Si la diferencia es entre 175 y 190 días, probablemente es semestral
        else if (daysDiff >= 175 && daysDiff <= 190) {
          recurringIncome[key].frequency = 180 // Semestral
        }

        recurringIncome[key].lastDate = date

        // Actualizar monto con un promedio ponderado, dando más peso a las transacciones recientes
        recurringIncome[key].amount = recurringIncome[key].amount * 0.7 + transaction.amount * 0.3
      }
    })

  // Calcular próximas fechas para ingresos recurrentes
  Object.values(recurringIncome).forEach((income) => {
    if (income.frequency > 0) {
      // Calcular las próximas 3 fechas
      for (let i = 1; i <= 3; i++) {
        const nextDate = new Date(income.lastDate)
        nextDate.setDate(nextDate.getDate() + income.frequency * i)
        income.nextDates.push(nextDate)
      }
    }
  })

  // Calcular el promedio de ingresos mensuales recientes (últimos 3 meses)
  const recentMonths = monthKeys.slice(-3)
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
    const dayOfMonth = getDate(futureMonth)

    // Base de predicción: promedio reciente + tendencia
    let predictedAmount = avgRecentMonthlyIncome + slope * i

    // Si tenemos suficientes datos, usar el modelo completo
    if (incomeValues.length >= 6) {
      predictedAmount = intercept + slope * (incomeValues.length + i - 1)
    }

    // Aplicar factor estacional si está disponible
    if (seasonalFactors[monthNumber]) {
      predictedAmount *= seasonalFactors[monthNumber]
    } else {
      // Ajustes estacionales genéricos si no hay datos históricos suficientes
      const month = monthNumber + 1 // 1-12 para legibilidad

      if (month === 12) {
        // Diciembre
        predictedAmount *= 1.1 // 10% más de ingresos en diciembre (bonos)
      } else if (month === 1) {
        // Enero
        predictedAmount *= 0.95 // 5% menos de ingresos en enero
      } else if ([6, 7].includes(month)) {
        // Junio, Julio (vacaciones)
        predictedAmount *= 1.05 // 5% más en verano
      }
    }

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
          monthDates.forEach(() => {
            predictedSources[income.category] += income.amount
            predictedAmount += income.amount
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

    predictions.push({
      month: monthKey,
      amount: Math.max(0, predictedAmount),
      sources: predictedSources,
      confidence,
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

      // Calcular aumento porcentual respecto al mes anterior
      if (lastMonthAmount > 0) {
        percentageIncrease = ((amount - lastMonthAmount) / lastMonthAmount) * 100
        if (percentageIncrease >= 30) {
          isAnomaly = true

          // Determinar severidad basada en el porcentaje de aumento
          if (percentageIncrease >= 100) {
            severity = "high"
          } else if (percentageIncrease >= 50) {
            severity = "medium"
          }
        }
      }

      // Verificar si está fuera del rango normal
      if (!isAnomaly) {
        const zScore = (amount - stats.avg) / (stats.stdDev || 1)
        if (zScore > 2) {
          isAnomaly = true
          percentageIncrease = ((amount - stats.avg) / stats.avg) * 100

          // Determinar severidad basada en el z-score
          if (zScore > 3) {
            severity = "high"
          } else if (zScore > 2.5) {
            severity = "medium"
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
        }
      }

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
    return b.percentageIncrease - a.percentageIncrease
  })
}

// Función mejorada para sugerir metas de ahorro con análisis avanzado
export function suggestSavingsGoals(transactions: Transaction[]): {
  amount: number
  description: string
  potentialSavings: { category: string; amount: number; suggestion: string }[]
  savingsRate: number
  timeToGoal: { months: number; amount: number; description: string }[]
  confidence: number
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
  const potentialSavings: { category: string; amount: number; suggestion: string; priority: number }[] = []

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

      if (savingsPotential >= 10) {
        // Solo sugerir si el ahorro es significativo
        potentialSavings.push({
          category,
          amount: savingsPotential,
          suggestion,
          priority,
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
    potentialSavings: potentialSavings.slice(0, 3), // Top 3 áreas de ahorro
    savingsRate,
    timeToGoal,
    confidence,
  }
}

// Exportar las funciones mejoradas

