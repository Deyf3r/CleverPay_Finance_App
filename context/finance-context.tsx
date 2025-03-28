"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { FinanceState, FinanceContextType, Transaction, TransactionType, AccountType } from "@/types/finance"
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

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    const result = storage.addAccount(accountData)
    setState(storage.loadData())
    return result
  }

  // Rename an account
  const renameAccount = async (accountType: AccountType, newName: string) => {
    if (!newName.trim()) {
      throw new Error("Account name is required")
    }

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedAccounts = { ...state.accounts }
    if (updatedAccounts[accountType]) {
      updatedAccounts[accountType] = {
        ...updatedAccounts[accountType],
        name: newName,
      }

      const updatedState = {
        ...state,
        accounts: updatedAccounts,
      }

      storage.saveData(updatedState)
      setState(updatedState)
      return true
    }

    throw new Error("Account not found")
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

    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Create withdrawal transaction
    const withdrawalTransaction: Omit<Transaction, "id"> = {
      type: "expense",
      amount,
      description: `Transfer to ${state.accounts[toAccount].name}`,
      category: "transfer",
      date: new Date().toISOString(),
      account: fromAccount,
    }

    // Create deposit transaction
    const depositTransaction: Omit<Transaction, "id"> = {
      type: "income",
      amount,
      description: `Transfer from ${state.accounts[fromAccount].name}`,
      category: "transfer",
      date: new Date().toISOString(),
      account: toAccount,
    }

    // Add both transactions
    storage.addTransaction(withdrawalTransaction)
    storage.addTransaction(depositTransaction)

    setState(storage.loadData())
    return true
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

