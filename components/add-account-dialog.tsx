"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, CreditCard, PiggyBank, Plus, Wallet } from "lucide-react"
import type { AccountType } from "@/types/finance"

interface AddAccountDialogProps {
  onAccountAdded?: () => void
}

export function AddAccountDialog({ onAccountAdded }: AddAccountDialogProps) {
  const { addAccount } = useFinance()
  const { formatCurrency } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    type?: string
    name?: string
    initialBalance?: string
  }>({})

  const [newAccount, setNewAccount] = useState({
    type: "" as AccountType,
    name: "",
    initialBalance: "",
  })

  const resetForm = () => {
    setNewAccount({
      type: "" as AccountType,
      name: "",
      initialBalance: "",
    })
    setFormErrors({})
  }

  const handleClose = () => {
    resetForm()
    setIsOpen(false)
  }

  const validateForm = () => {
    const errors: {
      type?: string
      name?: string
      initialBalance?: string
    } = {}

    if (!newAccount.type) {
      errors.type = "Please select an account type"
    }

    if (!newAccount.name.trim()) {
      errors.name = "Please enter an account name"
    }

    if (!newAccount.initialBalance.trim()) {
      errors.initialBalance = "Please enter an initial balance"
    } else {
      const balance = Number.parseFloat(newAccount.initialBalance)
      if (isNaN(balance)) {
        errors.initialBalance = "Please enter a valid number"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAccount = async () => {
    if (!validateForm()) return

    try {
      setIsSubmitting(true)

      const initialBalance = Number.parseFloat(newAccount.initialBalance)

      await addAccount({
        type: newAccount.type as AccountType,
        name: newAccount.name,
        initialBalance,
      })

      toast({
        title: "Account added successfully",
        description: `${newAccount.name} has been added with an initial balance of ${formatCurrency(initialBalance)}`,
      })

      handleClose()
      if (onAccountAdded) onAccountAdded()
    } catch (error) {
      toast({
        title: "Error adding account",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case "checking":
        return <Building className="h-5 w-5" />
      case "savings":
        return <PiggyBank className="h-5 w-5" />
      case "credit":
        return <CreditCard className="h-5 w-5" />
      case "cash":
        return <Wallet className="h-5 w-5" />
      default:
        return null
    }
  }

  const getAccountColor = (accountType: string) => {
    switch (accountType) {
      case "checking":
        return "text-blue-500 dark:text-blue-400"
      case "savings":
        return "text-green-500 dark:text-green-400"
      case "credit":
        return "text-purple-500 dark:text-purple-400"
      case "cash":
        return "text-amber-500 dark:text-amber-400"
      default:
        return "text-gray-500 dark:text-gray-400"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Enter the details for your new financial account</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-type">
              Account Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={newAccount.type}
              onValueChange={(value) => {
                setNewAccount({ ...newAccount, type: value as AccountType })
                setFormErrors({ ...formErrors, type: undefined })
              }}
            >
              <SelectTrigger id="account-type" className={formErrors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking" className="flex items-center">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Checking Account</span>
                  </div>
                </SelectItem>
                <SelectItem value="savings">
                  <div className="flex items-center">
                    <PiggyBank className="mr-2 h-4 w-4 text-green-500" />
                    <span>Savings Account</span>
                  </div>
                </SelectItem>
                <SelectItem value="credit">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                    <span>Credit Card</span>
                  </div>
                </SelectItem>
                <SelectItem value="cash">
                  <div className="flex items-center">
                    <Wallet className="mr-2 h-4 w-4 text-amber-500" />
                    <span>Cash</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {formErrors.type && <p className="text-xs text-red-500">{formErrors.type}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-name">
              Account Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              {newAccount.type && (
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${getAccountColor(newAccount.type)}`}>
                  {getAccountIcon(newAccount.type)}
                </div>
              )}
              <Input
                id="account-name"
                placeholder="e.g. My Checking Account"
                value={newAccount.name}
                onChange={(e) => {
                  setNewAccount({ ...newAccount, name: e.target.value })
                  setFormErrors({ ...formErrors, name: undefined })
                }}
                className={`${newAccount.type ? "pl-10" : ""} ${formErrors.name ? "border-red-500" : ""}`}
              />
            </div>
            {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial-balance">
              Initial Balance <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="initial-balance"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={newAccount.initialBalance}
                onChange={(e) => {
                  // Allow only numbers and decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, "")
                  setNewAccount({ ...newAccount, initialBalance: value })
                  setFormErrors({ ...formErrors, initialBalance: undefined })
                }}
                className={`pl-8 ${formErrors.initialBalance ? "border-red-500" : ""}`}
              />
            </div>
            {formErrors.initialBalance && <p className="text-xs text-red-500">{formErrors.initialBalance}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleAddAccount} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

