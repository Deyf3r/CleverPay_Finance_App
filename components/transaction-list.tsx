"use client"

import { useState } from "react"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import { Edit2Icon, Trash2Icon } from "lucide-react"

import { useFinance } from "@/context/finance-context"
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

interface TransactionListProps {
  type?: TransactionType
  month?: string
}

export default function TransactionList({ type, month }: TransactionListProps) {
  const { getFilteredTransactions, deleteTransaction } = useFinance()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const transactions = getFilteredTransactions(type, month)

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    setDeleteId(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy")
  }

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  if (transactions.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No transactions found.</div>
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium">{transaction.description}</TableCell>
              <TableCell>{getCategoryLabel(transaction.category)}</TableCell>
              <TableCell>{formatDate(transaction.date)}</TableCell>
              <TableCell
                className={`text-right ${transaction.type === "income" ? "text-emerald-500" : "text-rose-500"}`}
              >
                {transaction.type === "income" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/edit-transaction/${transaction.id}`}>
                      <Edit2Icon className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(transaction.id)}>
                    <Trash2Icon className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

