export type TransactionType = "income" | "expense"

export type TransactionCategory =
  | "food"
  | "transportation"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "shopping"
  | "personal"
  | "education"
  | "travel"
  | "salary"
  | "investment"
  | "other"

export type AccountType = "checking" | "savings" | "credit" | "cash"

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  description: string
  category: TransactionCategory
  date: string // ISO string
  account: AccountType
  notes?: string
}

export interface FinanceState {
  transactions: Transaction[]
  accounts: {
    [key in AccountType]: {
      balance: number
      name: string
    }
  }
}

export interface FinanceContextType {
  state: FinanceState
  addTransaction: (transaction: Omit<Transaction, "id">) => void
  editTransaction: (id: string, transaction: Omit<Transaction, "id">) => void
  deleteTransaction: (id: string) => void
  getTransactionById: (id: string) => Transaction | undefined
  getFilteredTransactions: (type?: TransactionType, month?: string) => Transaction[]
  getTotalBalance: () => number
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getSavingsRate: () => number
  getMonthlyData: () => { month: string; income: number; expenses: number }[]
}

