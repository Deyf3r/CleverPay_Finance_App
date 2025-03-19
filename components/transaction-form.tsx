"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CalendarIcon } from "lucide-react"
import { format, parseISO } from "date-fns"

import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import type { TransactionType, TransactionCategory, AccountType } from "@/types/finance"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { currencies } from "@/lib/currencies"

interface TransactionFormProps {
  transactionId?: string
}

export default function TransactionForm({ transactionId }: TransactionFormProps) {
  const router = useRouter()
  const { addTransaction, editTransaction, getTransactionById } = useFinance()
  const { formatCurrency, translate, settings } = useSettings()
  const currencySymbol = currencies[settings.currency].symbol
  const currencyCode = settings.currency

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
        title: translate("alert.error"),
        description: translate("alert.enter_description"),
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        title: translate("alert.error"),
        description: translate("alert.enter_amount"),
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
        title: translate("alert.success"),
        description: translate("alert.transaction_updated"),
      })
    } else {
      addTransaction(transactionData)
      toast({
        title: translate("alert.success"),
        description: translate("alert.transaction_added"),
      })
    }

    router.push("/transactions")
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="transaction-type">{translate("transaction.type")}</Label>
          <RadioGroup
            id="transaction-type"
            value={type}
            onValueChange={(value) => setType(value as TransactionType)}
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="font-normal">
                {translate("transaction.expense")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="font-normal">
                {translate("transaction.income")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="amount">{translate("transaction.amount")}</Label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
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
              <span className="text-gray-500 sm:text-sm">{currencyCode}</span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="description">{translate("transaction.description")}</Label>
          <Input
            type="text"
            id="description"
            placeholder={translate("transaction.description_placeholder")}
            className="mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">{translate("transaction.category")}</Label>
          <Select value={category} onValueChange={(value) => setCategory(value as TransactionCategory)}>
            <SelectTrigger id="category" className="mt-1">
              <SelectValue placeholder={translate("transaction.select_category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">{translate("category.food")}</SelectItem>
              <SelectItem value="transportation">{translate("category.transportation")}</SelectItem>
              <SelectItem value="housing">{translate("category.housing")}</SelectItem>
              <SelectItem value="utilities">{translate("category.utilities")}</SelectItem>
              <SelectItem value="entertainment">{translate("category.entertainment")}</SelectItem>
              <SelectItem value="health">{translate("category.health")}</SelectItem>
              <SelectItem value="shopping">{translate("category.shopping")}</SelectItem>
              <SelectItem value="personal">{translate("category.personal")}</SelectItem>
              <SelectItem value="education">{translate("category.education")}</SelectItem>
              <SelectItem value="travel">{translate("category.travel")}</SelectItem>
              <SelectItem value="salary">{translate("category.salary")}</SelectItem>
              <SelectItem value="investment">{translate("category.investment")}</SelectItem>
              <SelectItem value="other">{translate("category.other")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date">{translate("transaction.date")}</Label>
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
          <Label htmlFor="account">{translate("transaction.account")}</Label>
          <Select value={account} onValueChange={(value) => setAccount(value as AccountType)}>
            <SelectTrigger id="account" className="mt-1">
              <SelectValue placeholder={translate("transaction.select_account")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">{translate("account.checking")}</SelectItem>
              <SelectItem value="savings">{translate("account.savings")}</SelectItem>
              <SelectItem value="credit">{translate("account.credit")}</SelectItem>
              <SelectItem value="cash">{translate("account.cash")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">{translate("transaction.notes")}</Label>
          <Input
            type="text"
            id="notes"
            placeholder={translate("transaction.notes_placeholder")}
            className="mt-1"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" asChild>
          <Link href="/transactions">{translate("transaction.cancel")}</Link>
        </Button>
        <Button type="submit">{isEditing ? translate("transaction.update") : translate("transaction.save")}</Button>
      </div>
    </form>
  )
}

