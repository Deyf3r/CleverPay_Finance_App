import type { Transaction, AccountType, FinanceState } from "@/types/finance"
import { v4 as uuidv4 } from "uuid"

// Clave para almacenar los datos en localStorage
const STORAGE_KEY = "finance_app_data"

// Estado inicial de la aplicación
const initialState: FinanceState = {
  transactions: [],
  accounts: {
    checking: { balance: 3000, name: "Checking Account" },
    savings: { balance: 10000, name: "Savings Account" },
    credit: { balance: -500, name: "Credit Card" },
    cash: { balance: 200, name: "Cash" },
  },
}

// Cargar datos del localStorage
export function loadData(): FinanceState {
  if (typeof window === "undefined") {
    return initialState
  }

  const savedData = localStorage.getItem(STORAGE_KEY)
  if (!savedData) {
    return initialState
  }

  try {
    return JSON.parse(savedData)
  } catch (error) {
    console.error("Error parsing saved data:", error)
    return initialState
  }
}

// Guardar datos en localStorage
export function saveData(data: FinanceState): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Añadir una transacción
export function addTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const data = loadData()
  const newTransaction = { ...transaction, id: uuidv4() }

  // Actualizar el saldo de la cuenta
  const amountChange = transaction.type === "income" ? transaction.amount : -transaction.amount
  data.accounts[transaction.account].balance += amountChange

  // Añadir la transacción
  data.transactions = [newTransaction, ...data.transactions]

  saveData(data)
  return newTransaction
}

// Editar una transacción
export function editTransaction(id: string, transaction: Omit<Transaction, "id">): Transaction | null {
  const data = loadData()
  const oldTransaction = data.transactions.find((t) => t.id === id)

  if (!oldTransaction) {
    return null
  }

  // Revertir el efecto de la transacción anterior
  const oldAmountChange = oldTransaction.type === "income" ? -oldTransaction.amount : oldTransaction.amount
  data.accounts[oldTransaction.account].balance += oldAmountChange

  // Aplicar el efecto de la nueva transacción
  const newAmountChange = transaction.type === "income" ? transaction.amount : -transaction.amount
  data.accounts[transaction.account].balance += newAmountChange

  // Actualizar la transacción
  const updatedTransaction = { ...transaction, id }
  data.transactions = data.transactions.map((t) => (t.id === id ? updatedTransaction : t))

  saveData(data)
  return updatedTransaction
}

// Eliminar una transacción
export function deleteTransaction(id: string): boolean {
  const data = loadData()
  const transaction = data.transactions.find((t) => t.id === id)

  if (!transaction) {
    return false
  }

  // Revertir el efecto de la transacción
  const amountChange = transaction.type === "income" ? -transaction.amount : transaction.amount
  data.accounts[transaction.account].balance += amountChange

  // Eliminar la transacción
  data.transactions = data.transactions.filter((t) => t.id !== id)

  saveData(data)
  return true
}

// Obtener todas las transacciones
export function getTransactions(): Transaction[] {
  const data = loadData()
  return data.transactions
}

// Obtener una transacción por ID
export function getTransactionById(id: string): Transaction | undefined {
  const data = loadData()
  return data.transactions.find((t) => t.id === id)
}

// Obtener el saldo de todas las cuentas
export function getAccounts(): Record<AccountType, { balance: number; name: string }> {
  const data = loadData()
  return data.accounts
}

// Cargar datos de ejemplo si no hay datos
export function loadSampleData(): void {
  const data = loadData()

  // Si ya hay transacciones, no cargar datos de ejemplo
  if (data.transactions.length > 0) {
    return
  }

  // Datos de ejemplo
  const sampleTransactions: Omit<Transaction, "id">[] = [
    {
      type: "income",
      amount: 3500,
      description: "Salary Deposit",
      category: "salary",
      date: new Date(2023, 2, 1).toISOString(),
      account: "checking",
    },
    {
      type: "expense",
      amount: 1200,
      description: "Rent Payment",
      category: "housing",
      date: new Date(2023, 2, 1).toISOString(),
      account: "checking",
    },
    {
      type: "expense",
      amount: 85.32,
      description: "Grocery Shopping",
      category: "food",
      date: new Date(2023, 1, 27).toISOString(),
      account: "credit",
    },
    {
      type: "income",
      amount: 750,
      description: "Freelance Payment",
      category: "other",
      date: new Date(2023, 1, 26).toISOString(),
      account: "checking",
    },
    {
      type: "expense",
      amount: 64.5,
      description: "Restaurant Dinner",
      category: "food",
      date: new Date(2023, 1, 25).toISOString(),
      account: "credit",
    },
    {
      type: "expense",
      amount: 59.99,
      description: "Internet Bill",
      category: "utilities",
      date: new Date(2023, 1, 24).toISOString(),
      account: "checking",
    },
    {
      type: "expense",
      amount: 45,
      description: "Mobile Phone Bill",
      category: "utilities",
      date: new Date(2023, 1, 23).toISOString(),
      account: "checking",
    },
    {
      type: "expense",
      amount: 4.5,
      description: "Coffee Shop",
      category: "food",
      date: new Date(2023, 1, 22).toISOString(),
      account: "cash",
    },
    {
      type: "expense",
      amount: 35,
      description: "Gym Membership",
      category: "health",
      date: new Date(2023, 1, 21).toISOString(),
      account: "checking",
    },
    {
      type: "income",
      amount: 120,
      description: "Dividend Payment",
      category: "investment",
      date: new Date(2023, 1, 20).toISOString(),
      account: "savings",
    },
  ]

  // Añadir transacciones de ejemplo
  sampleTransactions.forEach((transaction) => {
    addTransaction(transaction)
  })
}

