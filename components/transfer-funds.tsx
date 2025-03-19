"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface TransferFundsProps {
  onComplete: () => void
}

const currencies: { [key: string]: { symbol: string } } = {
  USD: { symbol: "$" },
  EUR: { symbol: "€" },
  GBP: { symbol: "£" },
  JPY: { symbol: "¥" },
}

export function TransferFunds({ onComplete }: TransferFundsProps) {
  const { state, addTransaction } = useFinance()
  const { formatCurrency, translate, settings } = useSettings()
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const currencySymbol = settings.currency === "USD" ? "$" : currencies[settings.currency].symbol

  const handleTransfer = () => {
    // Validaciones
    if (!fromAccount) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.select_from_account"),
        variant: "destructive",
      })
      return
    }

    if (!toAccount) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.select_to_account"),
        variant: "destructive",
      })
      return
    }

    if (fromAccount === toAccount) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.same_account"),
        variant: "destructive",
      })
      return
    }

    const amountValue = Number.parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.enter_valid_amount"),
        variant: "destructive",
      })
      return
    }

    const fromAccountBalance = state.accounts[fromAccount as keyof typeof state.accounts].balance
    if (amountValue > fromAccountBalance) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.insufficient_funds"),
        variant: "destructive",
      })
      return
    }

    // Crear transacciones de transferencia
    const transferDescription =
      description ||
      `${translate("accounts.transfer_from")} ${translate(`account.${fromAccount}`)} ${translate("accounts.to")} ${translate(`account.${toAccount}`)}`
    const now = new Date().toISOString()

    // Transacción de retiro
    addTransaction({
      type: "expense",
      amount: amountValue,
      description: transferDescription,
      category: "other",
      date: now,
      account: fromAccount as any,
      notes: `${translate("accounts.transfer_to")} ${translate(`account.${toAccount}`)}`,
    })

    // Transacción de depósito
    addTransaction({
      type: "income",
      amount: amountValue,
      description: transferDescription,
      category: "other",
      date: now,
      account: toAccount as any,
      notes: `${translate("accounts.transfer_from")} ${translate(`account.${fromAccount}`)}`,
    })

    toast({
      title: translate("alert.success"),
      description: translate("accounts.transfer_success"),
    })

    onComplete()
  }

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="from-account">{translate("accounts.from_account")}</Label>
        <Select value={fromAccount} onValueChange={setFromAccount}>
          <SelectTrigger id="from-account">
            <SelectValue placeholder={translate("accounts.select_account")} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(state.accounts).map((account) => (
              <SelectItem key={account} value={account}>
                {translate(`account.${account}`)} (
                {formatCurrency(state.accounts[account as keyof typeof state.accounts].balance)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="to-account">{translate("accounts.to_account")}</Label>
        <Select value={toAccount} onValueChange={setToAccount}>
          <SelectTrigger id="to-account">
            <SelectValue placeholder={translate("accounts.select_account")} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(state.accounts).map((account) => (
              <SelectItem key={account} value={account}>
                {translate(`account.${account}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">{translate("accounts.amount")}</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
          </div>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="pl-7"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          {translate("accounts.description")} ({translate("accounts.optional")})
        </Label>
        <Input
          id="description"
          placeholder={translate("accounts.transfer_description_placeholder")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onComplete}>
          {translate("accounts.cancel")}
        </Button>
        <Button onClick={handleTransfer}>{translate("accounts.transfer_funds")}</Button>
      </div>
    </div>
  )
}

