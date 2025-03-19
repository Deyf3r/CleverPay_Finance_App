"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { FinanceState, FinanceContextType, Transaction, TransactionType } from "@/types/finance"
import { format, parseISO } from "date-fns"
import * as storage from "@/lib/storage"

// Create context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FinanceState>({
    transactions: [],
    accounts: {
      checking: { balance: 0, name: "Checking Account" },
      savings: { balance: 0, name: "Savings Account" },
      credit: { balance: 0, name: "Credit Card" },
      cash: { balance: 0, name: "Cash" },
    },
  })

  // Cargar datos al iniciar
  useEffect(() => {
    // Cargar datos de ejemplo si no hay datos
    storage.loadSampleData()

    // Cargar datos del almacenamiento
    const data = storage.loadData()
    setState(data)
  }, [])

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = storage.addTransaction(transaction)
    setState(storage.loadData())
    return newTransaction
  }

  // Edit an existing transaction
  const editTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    const result = storage.editTransaction(id, transaction)
    setState(storage.loadData())
    return result
  }

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    const result = storage.deleteTransaction(id)
    setState(storage.loadData())
    return result
  }

  // Get a transaction by ID
  const getTransactionById = (id: string) => {
    return storage.getTransactionById(id)
  }

  // Get filtered transactions by type and/or month
  const getFilteredTransactions = (type?: TransactionType, month?: string) => {
    return state.transactions.filter((transaction) => {
      const transactionDate = parseISO(transaction.date)
      const transactionMonth = format(transactionDate, "MMMM yyyy")

      const typeMatch = type ? transaction.type === type : true
      const monthMatch = month ? transactionMonth === month : true

      return typeMatch && monthMatch
    })
  }

  // Calculate total balance across all accounts
  const getTotalBalance = () => {
    const accountsBalance = Object.values(state.accounts).reduce((total, account) => total + account.balance, 0)
    return Number.parseFloat(accountsBalance.toFixed(2))
  }

  // Calculate total income
  const getTotalIncome = () => {
    const total = state.transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return Number.parseFloat(total.toFixed(2))
  }

  // Calculate total expenses
  const getTotalExpenses = () => {
    const total = state.transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    return Number.parseFloat(total.toFixed(2))
  }

  // Calculate savings rate (income - expenses) / income
  const getSavingsRate = () => {
    const income = getTotalIncome()
    const expenses = getTotalExpenses()

    if (income === 0) return 0

    const rate = ((income - expenses) / income) * 100
    return Number.parseFloat(rate.toFixed(1))
  }

  // Get monthly data for charts
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

    state.transactions.forEach((transaction) => {
      const date = parseISO(transaction.date)
      const month = format(date, "MMM yyyy")

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 }
      }

      if (transaction.type === "income") {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expenses += transaction.amount
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: Number.parseFloat(data.income.toFixed(2)),
      expenses: Number.parseFloat(data.expenses.toFixed(2)),
    }))
  }

  const value = {
    state,
    addTransaction,
    editTransaction,
    deleteTransaction,
    getTransactionById,
    getFilteredTransactions,
    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getSavingsRate,
    getMonthlyData,
  }

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
}

// Custom hook to use the finance context
export const useFinance = () => {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

