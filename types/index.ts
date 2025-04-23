// Tipos para las cuentas
export type AccountType = "checking" | "savings" | "credit" | "cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

// Tipos para las transacciones
export type TransactionType = "ingreso" | "gasto" | "transferencia";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string | Date;
  category: string;
  type: TransactionType;
  account: AccountType;
  isRecurring?: boolean;
  recurringFrequency?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Tipos para el estado de finanzas
export interface FinanceState {
  accounts: Record<string, Account>;
  transactions: Transaction[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

// Tipos para el contexto de finanzas
export interface FinanceContextType {
  state: FinanceState;
  fetchAccounts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<Transaction>;
  editTransaction: (transaction: Transaction) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionById: (id: string) => Transaction | undefined;
}

// Tipos para el contexto de configuración
export interface SettingsContextType {
  currency: string;
  locale: string;
  theme: string;
  formatCurrency: (amount: number) => string;
  setCurrency: (currency: string) => void;
  setLocale: (locale: string) => void;
  setTheme: (theme: string) => void;
}
