"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { format, parseISO } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, Search } from "lucide-react"

interface AccountTransactionsProps {
  accountType: string
}

export function AccountTransactions({ accountType }: AccountTransactionsProps) {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionType, setTransactionType] = useState<string>("all")

  // Filtrar transacciones por cuenta
  const accountTransactions = state.transactions
    .filter((t) => t.account === accountType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Aplicar filtros adicionales
  const filteredTransactions = accountTransactions.filter((transaction) => {
    const matchesSearch =
      searchTerm === "" ||
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = transactionType === "all" || transaction.type === transactionType

    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  const getCategoryLabel = (category: string) => {
    return translate(`category.${category}`)
  }

  if (accountTransactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{translate("accounts.no_transactions")}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={translate("accounts.search_transactions")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={translate("accounts.transaction_type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{translate("accounts.all_transactions")}</SelectItem>
            <SelectItem value="income">{translate("accounts.income")}</SelectItem>
            <SelectItem value="expense">{translate("accounts.expenses")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{translate("accounts.no_matching_transactions")}</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translate("accounts.date")}</TableHead>
                <TableHead>{translate("accounts.description")}</TableHead>
                <TableHead>{translate("accounts.category")}</TableHead>
                <TableHead className="text-right">{translate("accounts.amount")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end">
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="mr-1 h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="mr-1 h-4 w-4 text-rose-500 dark:text-rose-400" />
                      )}
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-emerald-500 dark:text-emerald-400"
                            : "text-rose-500 dark:text-rose-400"
                        }
                      >
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

