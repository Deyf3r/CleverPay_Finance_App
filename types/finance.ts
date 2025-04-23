import type { Transaction as PrismaTransaction, Tag as PrismaTag } from "@prisma/client"

// Tipos de transacciones
export type TransactionType = "income" | "expense"

// Tipos de cuentas
export type AccountType = "checking" | "savings" | "credit" | "cash"

// Categorías de transacciones
export type TransactionCategory =
  | "Salario"
  | "Inversiones"
  | "Regalos"
  | "Bonos"
  | "Freelance"
  | "Alquileres"
  | "Dividendos"
  | "Reembolsos"
  | "Ventas"
  | "Alimentación"
  | "Transporte"
  | "Vivienda"
  | "Entretenimiento"
  | "Salud"
  | "Educación"
  | "Ropa"
  | "Servicios"
  | "Viajes"
  | "Tecnología"
  | "Mascotas"
  | "Impuestos"
  | "Seguros"
  | "Otros"

// Estructura de una transacción
export interface Transaction extends PrismaTransaction {
  tags: Tag[]
}

// Estructura de una etiqueta
export interface Tag extends PrismaTag {}

// Estructura de una cuenta
export interface Account {
  balance: number
  name: string
}

// Estructura del estado de finanzas
export interface FinanceState {
  transactions: Transaction[]
  accounts: {
    [key in AccountType]: Account
  }
}

// Tipo para el contexto de finanzas
export interface FinanceContextType {
  state: FinanceState
  isLoading: boolean
  addTransaction: (transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "tags">) => Promise<Transaction>
  editTransaction: (id: string, transaction: Omit<Transaction, "id" | "userId" | "createdAt" | "updatedAt" | "tags">) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<boolean>
  getTransactionById: (id: string) => Promise<Transaction>
  addAccount: (accountData: { type: AccountType; name: string; initialBalance: number }) => Promise<Account>
  renameAccount: (accountType: AccountType, newName: string) => Promise<boolean>
  transferFunds: (fromAccount: AccountType, toAccount: AccountType, amount: number) => Promise<boolean>
  getFilteredTransactions: (type?: TransactionType, month?: string) => Transaction[]
  getTotalBalance: () => number
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getSavingsRate: () => number
  getMonthlyData: () => { month: string; income: number; expenses: number }[]
}
