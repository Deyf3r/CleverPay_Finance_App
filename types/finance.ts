// Tipos de transacciones
export type TransactionType = "income" | "expense"

// Tipos de cuentas
export type AccountType = "checking" | "savings" | "credit" | "cash"

// Categorías de transacciones
export type TransactionCategory =
  | "food"
  | "transportation"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "education"
  | "shopping"
  | "travel"
  | "salary"
  | "investment"
  | "other"

// Estructura de una transacción
export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date: string
  account: AccountType
}

// Estructura del estado de finanzas
export interface FinanceState {
  transactions: Transaction[]
  accounts: Record<AccountType, { balance: number; name: string }>
}

// Tipo para el contexto de finanzas
export interface FinanceContextType {
  state: FinanceState
  addTransaction: (transaction: Omit<Transaction, "id">) => Transaction
  editTransaction: (id: string, transaction: Omit<Transaction, "id">) => Transaction | null
  deleteTransaction: (id: string) => boolean
  getTransactionById: (id: string) => Transaction | undefined
  addAccount: (accountData: { type: AccountType; name: string; initialBalance: number }) => boolean
  getFilteredTransactions: (type?: TransactionType, month?: string) => Transaction[]
  getTotalBalance: () => number
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getSavingsRate: () => number
  getMonthlyData: () => { month: string; income: number; expenses: number }[]
}

