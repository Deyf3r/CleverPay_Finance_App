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
  const { formatCurrency } = useSettings()
  const [searchTerm, setSearchTerm] = useState("")
  const [transactionType, setTransactionType] = useState<string>("all")
  const [limit, setLimit] = useState<number>(10)

  // Filtrar transacciones por cuenta
  const transactions = state.transactions

  // Make sure the component is properly filtering transactions
  const filteredTransactions = transactions
    .filter((transaction) => transaction.account === accountType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter((transaction) => {
      const matchesSearch =
        searchTerm === "" ||
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesType = transactionType === "all" || transaction.type === transactionType

      return matchesSearch && matchesType
    })
    .slice(0, limit)

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  const getCategoryLabel = (category: string) => {
    return category
  }

  if (transactions.filter((t) => t.account === accountType).length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions for this account.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No matching transactions</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
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
