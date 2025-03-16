"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useFinance } from "@/context/finance-context"
import type { TransactionType, TransactionCategory, AccountType } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface TransactionFormProps {
  transactionId?: string
}

export default function TransactionForm({ transactionId }: TransactionFormProps) {
  const router = useRouter()
  const { addTransaction, editTransaction, getTransactionById } = useFinance()

  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TransactionCategory>("other")
  const [date, setDate] = useState<Date>(new Date())
  const [account, setAccount] = useState<AccountType>("checking")
  const [notes, setNotes] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (transactionId) {
      const transaction = getTransactionById(transactionId)
      if (transaction) {
        setIsEditing(true)
        setType(transaction.type)
        setAmount(transaction.amount.toString())
        setDescription(transaction.description)
        setCategory(transaction.category)
        setDate(parseISO(transaction.date))
        setAccount(transaction.account)
        setNotes(transaction.notes || "")
      } else {
        router.push("/transactions")
      }
    }
  }, [transactionId, getTransactionById, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    const transactionData = {
      type,
      amount: Number.parseFloat(amount),
      description,
      category,
      date: date.toISOString(),
      account,
      notes: notes.trim() || undefined,
    }

    if (isEditing && transactionId) {
      editTransaction(transactionId, transactionData)
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      })
    } else {
      addTransaction(transactionData)
      toast({
        title: "Success",
        description: "Transaction added successfully",
      })
    }

    router.push("/transactions")
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="transaction-type">Transaction Type</Label>
          <RadioGroup
            id="transaction-type"
            value={type}
            onValueChange={(value) => setType(value as TransactionType)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="font-normal">
                Expense
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="font-normal">
                Income
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <Input
              type="number"
              name="amount"
              id="amount"
              className="pl-7 pr-12"
              placeholder="0.00"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            placeholder="e.g. Grocery shopping"
            className="mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
            <SelectTrigger id="category" className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="health">Health & Fitness</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="personal">Personal Care</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
              <SelectItem value="salary">Salary</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button id="date" variant={"outline"} className="w-full justify-start text-left font-normal mt-1">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label htmlFor="account">Account</Label>
          <Select value={account} onValueChange={(value) => setAccount(value as AccountType)}>
            <SelectTrigger id="account" className="mt-1">
              <SelectValue placeholder="Select an account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">Checking Account</SelectItem>
              <SelectItem value="savings">Savings Account</SelectItem>
              <SelectItem value="credit">Credit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            type="text"
            id="notes"
            placeholder="Additional details about this transaction"
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href="/transactions">Cancel</Link>
        </Button>
        <Button type="submit">{isEditing ? "Update Transaction" : "Save Transaction"}</Button>
      </div>
    </form>
  )
}

