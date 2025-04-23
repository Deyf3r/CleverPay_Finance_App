"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSettings } from "@/context/settings-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { FeatureGate } from "./feature-gate"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getFeatureLimit } from "@/utils/subscription-utils"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  category: string
  date: string
  account: string
  notes?: string
}

interface TransactionsListProps {
  transactions: Transaction[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function TransactionsList({ transactions, onEdit, onDelete }: TransactionsListProps) {
  const { formatCurrency, formatDate } = useSettings()
  const { toast } = useToast()
  const { user } = useAuth()
  const userPlan = user?.subscriptionPlan || "free"

  // Obtener el límite de transacciones para el plan del usuario
  const transactionsLimit = getFeatureLimit("transactions_limit", userPlan)

  // Determinar si se ha alcanzado el límite
  const hasReachedLimit = transactions.length >= transactionsLimit

  // Calcular cuántas transacciones se pueden mostrar
  const displayedTransactions =
    transactionsLimit === Number.POSITIVE_INFINITY ? transactions : transactions.slice(0, transactionsLimit)

  const handleDelete = (id: string) => {
    if (onDelete) {
      onDelete(id)
    } else {
      toast({
        title: "Transacción eliminada",
        description: "La transacción ha sido eliminada correctamente.",
      })
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      Alimentación: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Transporte: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Entretenimiento: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Servicios: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      Salud: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      Educación: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
      Hogar: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Ropa: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      Salario: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      Inversiones: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
      Otros: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
    }

    return categoryColors[category] || categoryColors["Otros"]
  }

  return (
    <div className="space-y-4">
      {hasReachedLimit && transactionsLimit !== Number.POSITIVE_INFINITY && (
        <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-800 dark:text-amber-400">Límite de transacciones alcanzado</AlertTitle>
          <AlertDescription className="text-amber-700 dark:text-amber-500">
            Has alcanzado el límite de {transactionsLimit} transacciones para tu plan actual. Actualiza a un plan
            superior para gestionar más transacciones.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800/70">
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead className="hidden md:table-cell">Cuenta</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedTransactions.length > 0 ? (
              displayedTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <TableCell>
                    <div className="flex items-center">
                      <div
                        className={`rounded-full p-1.5 ${
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCategoryColor(transaction.category)}>
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(new Date(transaction.date))}</TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.account}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      transaction.type === "income"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit && onEdit(transaction.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(transaction.id)}
                          className="text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay transacciones para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasReachedLimit && transactionsLimit !== Number.POSITIVE_INFINITY && (
        <FeatureGate feature="transactions_limit" currentCount={transactions.length} compact={true} />
      )}
    </div>
  )
}
