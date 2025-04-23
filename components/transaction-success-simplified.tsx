"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Transaction, AccountType } from "@/types/finance"
import { useSettings } from "@/context/settings-context"
import { CheckCircle } from "lucide-react"

interface TransactionSuccessProps {
  transaction?: Transaction
  fromAccount?: AccountType
  toAccount?: AccountType
  amount?: number
  type: "transfer" | "payment" | "income" | "expense"
  onClose?: () => void
}

export function TransactionSuccessSimplified({
  transaction,
  fromAccount,
  toAccount,
  amount,
  type,
  onClose,
}: TransactionSuccessProps) {
  const { formatCurrency, translate } = useSettings()

  // Títulos corregidos para cada tipo de transacción
  const getTitleText = () => {
    switch (type) {
      case "transfer":
        return translate("transactions.transfer_successful") || "Transferencia Exitosa"
      case "payment":
        return translate("transactions.payment_successful") || "Pago Exitoso"
      case "income":
        return translate("transactions.income_recorded") || "Ingreso Registrado"
      case "expense":
        return translate("transactions.expense_recorded") || "Gasto Registrado"
      default:
        return translate("transactions.transaction_successful") || "Transacción Exitosa"
    }
  }

  // Función para obtener traducciones con valores predeterminados
  const getLabel = (key: string, defaultValue: string): string => {
    const translated = translate(key)
    return translated === key ? defaultValue : translated
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
        >
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h2 className="text-xl font-bold">{getTitleText()}</h2>

          {type === "transfer" && fromAccount && toAccount && (
            <div className="bg-muted/20 rounded-lg p-4 mt-4 text-left space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{getLabel("accounts.from", "De")}</p>
                  <p className="font-medium">{getLabel(`account.${fromAccount}`, fromAccount)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {fromAccount.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">{getLabel("accounts.to", "Para")}</p>
                  <p className="font-medium">{getLabel(`account.${toAccount}`, toAccount)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {toAccount.charAt(0).toUpperCase()}
                </div>
              </div>

              {amount && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">{getLabel("transaction.amount", "Monto")}</p>
                  <p className="font-bold text-lg">{formatCurrency(amount)}</p>
                </div>
              )}
            </div>
          )}

          {(type === "income" || type === "expense" || type === "payment") && transaction && (
            <div className="bg-muted/20 rounded-lg p-4 mt-4 text-left space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{getLabel("transaction.amount", "Monto")}</p>
                <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{getLabel("transaction.description", "Descripción")}</p>
                <p className="font-medium">{transaction.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{getLabel("transaction.category", "Categoría")}</p>
                <p className="font-medium">{getLabel(`category.${transaction.category}`, transaction.category)}</p>
              </div>
            </div>
          )}

          <Button onClick={onClose} className="w-full mt-6">
            {getLabel("common.close", "Cerrar")}
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}
