"use client"

import type React from "react"
import { createContext, useContext, useEffect, useReducer } from "react"
import { v4 as uuidv4 } from "uuid"
import type { FinanceState, FinanceContextType, Transaction, TransactionType } from "@/types/finance"
import { format, parseISO } from "date-fns"

// Initial state
const initialState: FinanceState = {
  transactions: [],
  accounts: {
    checking: { balance: 3000, name: "Checking Account" },
    savings: { balance: 10000, name: "Savings Account" },
    credit: { balance: -500, name: "Credit Card" },
    cash: { balance: 200, name: "Cash" },
  },
}

// Action types
type Action =
  | { type: "ADD_TRANSACTION"; payload: Omit<Transaction, "id"> }
  | { type: "EDIT_TRANSACTION"; payload: { id: string; transaction: Omit<Transaction, "id"> } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_STATE"; payload: FinanceState }

// Reducer
function financeReducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [{ ...action.payload, id: uuidv4() }, ...state.transactions],
      }
    case "EDIT_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? { ...action.payload.transaction, id: transaction.id } : transaction,
        ),
      }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      }
    case "SET_STATE":
      return action.payload
    default:
      return state
  }
}

// Create context
const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// Sample data for initial load
const sampleTransactions: Omit<Transaction, "id">[] = [
  {
    type: "income",
    amount: 3500,
    description: "Salary Deposit",
    category: "salary",
    date: new Date(2023, 2, 1).toISOString(), // March 1, 2023
    account: "checking",
  },
  {
    type: "expense",
    amount: 1200,
    description: "Rent Payment",
    category: "housing",
    date: new Date(2023, 2, 1).toISOString(), // March 1, 2023
    account: "checking",
  },
  {
    type: "expense",
    amount: 85.32,
    description: "Grocery Shopping",
    category: "food",
    date: new Date(2023, 1, 27).toISOString(), // February 27, 2023
    account: "credit",
  },
  {
    type: "income",
    amount: 750,
    description: "Freelance Payment",
    category: "other",
    date: new Date(2023, 1, 26).toISOString(), // February 26, 2023
    account: "checking",
  },
  {
    type: "expense",
    amount: 64.5,
    description: "Restaurant Dinner",
    category: "food",
    date: new Date(2023, 1, 25).toISOString(), // February 25, 2023
    account: "credit",
  },
  {
    type: "expense",
    amount: 59.99,
    description: "Internet Bill",
    category: "utilities",
    date: new Date(2023, 1, 24).toISOString(), // February 24, 2023
    account: "checking",
  },
  {
    type: "expense",
    amount: 45,
    description: "Mobile Phone Bill",
    category: "utilities",
    date: new Date(2023, 1, 23).toISOString(), // February 23, 2023
    account: "checking",
  },
  {
    type: "expense",
    amount: 4.5,
    description: "Coffee Shop",
    category: "food",
    date: new Date(2023, 1, 22).toISOString(), // February 22, 2023
    account: "cash",
  },
  {
    type: "expense",
    amount: 35,
    description: "Gym Membership",
    category: "health",
    date: new Date(2023, 1, 21).toISOString(), // February 21, 2023
    account: "checking",
  },
  {
    type: "income",
    amount: 120,
    description: "Dividend Payment",
    category: "investment",
    date: new Date(2023, 1, 20).toISOString(), // February 20, 2023
    account: "savings",
  },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, initialState)

  // Load state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem("financeState")

    if (savedState) {
      dispatch({ type: "SET_STATE", payload: JSON.parse(savedState) })
    } else {
      // Load sample data if no saved state
      sampleTransactions.forEach((transaction) => {
        dispatch({ type: "ADD_TRANSACTION", payload: transaction })
      })
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("financeState", JSON.stringify(state))
  }, [state])

  // Add a new transaction
  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    dispatch({ type: "ADD_TRANSACTION", payload: transaction })
  }

  // Edit an existing transaction
  const editTransaction = (id: string, transaction: Omit<Transaction, "id">) => {
    dispatch({ type: "EDIT_TRANSACTION", payload: { id, transaction } })
  }

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id })
  }

  // Get a transaction by ID
  const getTransactionById = (id: string) => {
    return state.transactions.find((transaction) => transaction.id === id)
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

