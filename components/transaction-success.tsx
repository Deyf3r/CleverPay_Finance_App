"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import type { Transaction, AccountType } from "@/types/finance"
import { useSettings } from "@/context/settings-context"

interface CheckmarkProps {
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

interface TransactionSuccessProps {
  transaction?: Transaction
  fromAccount?: AccountType
  toAccount?: AccountType
  amount?: number
  type: "transfer" | "payment" | "income" | "expense"
  onClose?: () => void
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
}

export function Checkmark({ size = 100, strokeWidth = 2, color = "currentColor", className = "" }: CheckmarkProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  )
}

export function TransactionSuccess({
  transaction,
  fromAccount,
  toAccount,
  amount,
  type,
  onClose,
}: TransactionSuccessProps) {
  const { formatCurrency, translate } = useSettings()

  // Función para obtener traducciones con valores predeterminados
  const getLabel = (key: string, defaultValue: string): string => {
    const translated = translate(key)
    return translated === key ? defaultValue : translated
  }

  // Títulos corregidos para cada tipo de transacción
  const getTitle = () => {
    switch (type) {
      case "transfer":
        return getLabel("transactions.transfer_successful", "Transferencia Exitosa")
      case "payment":
        return getLabel("transactions.payment_successful", "Pago Exitoso")
      case "income":
        return getLabel("transactions.income_recorded", "Ingreso Registrado")
      case "expense":
        return getLabel("transactions.expense_recorded", "Gasto Registrado")
      default:
        return getLabel("transactions.transaction_successful", "Transacción Exitosa")
    }
  }

  return (
    <Card className="w-full max-w-sm mx-auto p-6 min-h-[300px] flex flex-col justify-center dark:bg-card/95 backdrop-blur-sm border-border/30">
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: {
              type: "spring",
              damping: 15,
              stiffness: 200,
            },
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-xl bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
            <Checkmark
              size={80}
              strokeWidth={4}
              color="rgb(16 185 129)"
              className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>
        <motion.div
          className="space-y-2 text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.h2
            className="text-lg tracking-tighter font-semibold uppercase"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            {getTitle()}
          </motion.h2>

          {type === "transfer" && fromAccount && toAccount && (
            <div className="flex items-center gap-4">
              <motion.div
                className="flex-1 bg-muted/20 rounded-xl p-3 border border-border/30 backdrop-blur-md"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 1.2,
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <div className="flex flex-col items-start gap-2">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>From</title>
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      {getLabel("accounts.from", "De")}
                    </span>
                    <div className="flex items-center gap-2.5 group transition-all">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shadow-lg border border-border/30 text-sm font-medium text-primary group-hover:scale-105 transition-transform">
                        {fromAccount.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium tracking-tight">
                        {getLabel(`account.${fromAccount}`, fromAccount)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <svg
                        className="w-3 h-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <title>To</title>
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                      {getLabel("accounts.to", "Para")}
                    </span>
                    <div className="flex items-center gap-2.5 group transition-all">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 shadow-lg border border-border/30 text-sm font-medium text-primary group-hover:scale-105 transition-transform">
                        {toAccount.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-medium tracking-tight">{getLabel(`account.${toAccount}`, toAccount)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {(type === "income" || type === "expense" || type === "payment") && transaction && (
            <motion.div
              className="flex-1 bg-muted/20 rounded-xl p-3 border border-border/30 backdrop-blur-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div className="flex flex-col items-start gap-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getLabel("transaction.amount", "Monto")}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-lg tracking-tight">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getLabel("transaction.description", "Descripción")}
                  </span>
                  <div className="font-medium tracking-tight">{transaction.description}</div>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">
                    {getLabel("transaction.category", "Categoría")}
                  </span>
                  <div className="font-medium tracking-tight">
                    {getLabel(`category.${transaction.category}`, transaction.category)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            className="w-full text-xs text-muted-foreground mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.4 }}
          >
            {amount && formatCurrency(amount)}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.4 }}
          >
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {getLabel("common.close", "Cerrar")}
            </button>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  )
}

