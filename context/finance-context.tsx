"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { FinanceState, FinanceContextType, Transaction, TransactionType, AccountType } from "@/types/finance"
import { format, parseISO } from "date-fns"
import { toast } from "sonner"

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
    // Cargar transacciones de la API
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/transactions")
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || "Error al cargar las transacciones")
        }
        const data = await response.json()
        setState(prev => ({
          ...prev,
          transactions: data
        }))
      } catch (error) {
        console.error("Error loading transactions:", error)
        toast.error("Error al cargar las transacciones")
      }
    }

    fetchTransactions()
  }, [])

  // Add a new transaction
  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "tags">) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al guardar la transacción")
      }

      const newTransaction = await response.json()
      setState(prev => ({
        ...prev,
        transactions: [newTransaction, ...prev.transactions]
      }))

      return newTransaction
    } catch (error) {
      console.error("Error saving transaction:", error)
      toast.error("Error al guardar la transacción")
      throw error
    }
  }

  // Edit an existing transaction
  const editTransaction = async (id: string, transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "tags">) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al editar la transacción")
      }

      const updatedTransaction: Transaction = await response.json()
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? updatedTransaction : t)
      }))

      return updatedTransaction
    } catch (error) {
      console.error("Error editing transaction:", error)
      toast.error("Error al editar la transacción")
      throw error
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al eliminar la transacción")
      }

      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }))

      return true
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error("Error al eliminar la transacción")
      throw error
    }
  }

  // Get a transaction by ID
  const getTransactionById = async (id: string) => {
    try {
      const response = await fetch(`/api/transactions/${id}`)
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al cargar la transacción")
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error loading transaction:", error)
      toast.error("Error al cargar la transacción")
      throw error
    }
  }

  // Add a new account
  const addAccount = async (accountData: { type: AccountType; name: string; initialBalance: number }) => {
    // Add validation
    if (!accountData.type) {
      throw new Error("Account type is required")
    }

    if (!accountData.name.trim()) {
      throw new Error("Account name is required")
    }

    if (isNaN(accountData.initialBalance)) {
      throw new Error("Initial balance must be a valid number")
    }

    // Check if account type already exists
    if (state.accounts[accountData.type]) {
      throw new Error(`An account of type ${accountData.type} already exists`)
    }

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al guardar la cuenta")
      }

      const newAccount = await response.json()
      setState(prev => ({
        ...prev,
        accounts: { ...prev.accounts, [newAccount.type]: newAccount }
      }))

      return newAccount
    } catch (error) {
      console.error("Error saving account:", error)
      toast.error("Error al guardar la cuenta")
      throw error
    }
  }

  // Rename an account
  const renameAccount = async (accountType: AccountType, newName: string) => {
    if (!newName.trim()) {
      throw new Error("Account name is required")
    }

    try {
      const response = await fetch(`/api/accounts/${accountType}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al renombrar la cuenta")
      }

      const updatedAccount = await response.json()
      setState(prev => ({
        ...prev,
        accounts: { ...prev.accounts, [updatedAccount.type]: updatedAccount }
      }))

      return true
    } catch (error) {
      console.error("Error renaming account:", error)
      toast.error("Error al renombrar la cuenta")
      throw error
    }
  }

  // Transfer funds between accounts
  const transferFunds = async (fromAccount: AccountType, toAccount: AccountType, amount: number) => {
    if (fromAccount === toAccount) {
      throw new Error("Cannot transfer to the same account")
    }

    if (amount <= 0) {
      throw new Error("Transfer amount must be greater than zero")
    }

    if (!state.accounts[fromAccount]) {
      throw new Error("Source account not found")
    }

    if (!state.accounts[toAccount]) {
      throw new Error("Destination account not found")
    }

    if (state.accounts[fromAccount].balance < amount) {
      throw new Error("Insufficient funds in source account")
    }

    try {
      const response = await fetch("/api/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromAccount, toAccount, amount }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Error al transferir fondos")
      }

      const transferData = await response.json()
      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, ...transferData.transactions],
        accounts: { ...prev.accounts, [fromAccount]: transferData.fromAccount, [toAccount]: transferData.toAccount }
      }))

      return true
    } catch (error) {
      console.error("Error transferring funds:", error)
      toast.error("Error al transferir fondos")
      throw error
    }
  }

  // Get filtered transactions by type and/or month
  const getFilteredTransactions = (type?: TransactionType, month?: string) => {
    return state.transactions.filter((transaction) => {
      const transactionMonth = format(transaction.date, "MMMM yyyy")

      const typeMatch = type ? transaction.type === type : true
      const monthMatch = month ? transactionMonth === month : true

      return typeMatch && monthMatch
    })
  }

  // Get monthly data for charts
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expenses: number } } = {}

    state.transactions.forEach((transaction) => {
      const month = format(transaction.date, "MMM yyyy")

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

  const value = {
    state,
    addTransaction,
    editTransaction,
    deleteTransaction,
    getTransactionById,
    addAccount,
    renameAccount,
    transferFunds,
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
