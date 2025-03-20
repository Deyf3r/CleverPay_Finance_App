"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Edit2Icon, Trash2Icon, ArrowUpRight, ArrowDownRight } from "lucide-react"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import type { TransactionType } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"

interface TransactionListProps {
  type?: TransactionType
  month?: string
}

export default function TransactionList({ type, month }: TransactionListProps) {
  const { getFilteredTransactions, deleteTransaction } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const transactions = getFilteredTransactions(type, month)

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setDeleteId(null)
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  const getCategoryLabel = (category: string) => {
    return translate(`category.${category}`)
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">{translate("transactions.not_found")}</div>
  }

  return (
    <>
      <div className="rounded-md border dark:border-border/20 elevated-surface">
        <Table>
          <TableHeader className="table-header dark:bg-card">
            <TableRow className="dark:border-border/20">
              <TableHead>{translate("transaction.date")}</TableHead>
              <TableHead>{translate("transaction.description")}</TableHead>
              <TableHead>{translate("transaction.category")}</TableHead>
              <TableHead>{translate("transaction.account")}</TableHead>
              <TableHead className="text-right">{translate("transaction.amount")}</TableHead>
              <TableHead className="text-right">{translate("transaction.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, index) => (
              <TableRow
                key={transaction.id}
                className={`dark:border-border/20 ${index % 2 === 1 ? "dark:bg-muted/5" : ""}`}
              >
                <TableCell className="font-medium">{formatDate(transaction.date)}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal badge-outline">
                    {getCategoryLabel(transaction.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal dark:bg-muted/10">
                    {translate(`account.${transaction.account}`)}
                  </Badge>
                </TableCell>
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
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="dark:hover:bg-muted/20">
                      <Link href={`/edit-transaction/${transaction.id}`}>
                        <Edit2Icon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(transaction.id)}
                      className="dark:hover:bg-muted/20"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="dark:bg-card dark:border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle>{translate("alert.confirm")}</AlertDialogTitle>
            <AlertDialogDescription>{translate("alert.delete_transaction")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-muted/10 dark:border-border/30 dark:hover:bg-muted/30">
              {translate("alert.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 dark:text-white"
            >
              {translate("alert.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

