"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import type { AccountType } from "@/types/finance"
import { TransactionSuccessSimplified } from "@/components/transaction-success-simplified"

interface TransferFundsProps {
  onComplete: () => void
}

export function TransferFunds({ onComplete }: TransferFundsProps) {
  const { state, addTransaction } = useFinance()
  const { formatCurrency, translate, settings } = useSettings()
  const [fromAccount, setFromAccount] = useState<string>("")
  const [toAccount, setToAccount] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [transferAmount, setTransferAmount] = useState(0)

  // Obtener el símbolo de la moneda de forma segura
  const getCurrencySymbol = (): string => {
    // Valores predeterminados para diferentes monedas
    const defaultSymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      AUD: "A$",
      CAD: "C$",
      DOP: "RD$",
    }

    // Intentar obtener el símbolo de la configuración actual
    try {
      // Si la moneda existe en defaultSymbols, usarla
      if (settings.currency && defaultSymbols[settings.currency]) {
        return defaultSymbols[settings.currency]
      }
      // Si no, usar $ como valor predeterminado
      return "$"
    } catch (error) {
      // En caso de cualquier error, devolver $ como símbolo predeterminado
      console.error("Error al obtener el símbolo de la moneda:", error)
      return "$"
    }
  }

  const currencySymbol = getCurrencySymbol()

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

    setTransferAmount(amountValue)
    setShowSuccess(true)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    onComplete()
  }

  if (showSuccess) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <TransactionSuccessSimplified
            type="transfer"
            fromAccount={fromAccount as AccountType}
            toAccount={toAccount as AccountType}
            amount={transferAmount}
            onClose={handleCloseSuccess}
          />
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      className="space-y-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
        <Button onClick={handleTransfer} className="relative overflow-hidden group">
          <span className="relative z-10">{translate("accounts.transfer_funds")}</span>
          <span className="absolute inset-0 bg-primary-foreground/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
        </Button>
      </div>
    </motion.div>
  )
}

