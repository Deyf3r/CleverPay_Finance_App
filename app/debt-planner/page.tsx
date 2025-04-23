"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ArrowLeft, CreditCard, Wallet, TrendingDown, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"

export default function DebtPlannerPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()

  // Sample debt data
  const debts = [
    {
      type: "credit_card",
      name: translate("debt.credit_card"),
      balance: 3500,
      interestRate: 18,
      priority: "high",
      icon: <CreditCard className="h-5 w-5 text-rose-500" />,
    },
    {
      type: "personal_loan",
      name: translate("debt.personal_loan"),
      balance: 5000,
      interestRate: 8,
      priority: "medium",
      icon: <Wallet className="h-5 w-5 text-blue-500" />,
    },
  ]

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4 },
    },
  }

  const staggerItems = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 space-y-6 max-w-4xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/ai-insights")} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {translate("debt.debt_reduction_strategy")}
          </h1>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard">
            <TrendingDown className="h-4 w-4" />
            {translate("nav.dashboard")}
          </Link>
        </Button>
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="border-2 border-rose-100 dark:border-rose-900/30 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-b border-rose-100 dark:border-rose-900/20">
            <CardTitle className="text-2xl font-bold text-rose-700 dark:text-rose-400">
              {translate("debt.reduce_high_interest")}
            </CardTitle>
            <CardDescription className="text-rose-600/80 dark:text-rose-400/80 text-base">
              {translate("debt.credit_card_explanation")}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={staggerItems} initial="hidden" animate="visible">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2 text-rose-700 dark:text-rose-400">
                    {translate("debt.your_debts")}
                  </h2>

                  {debts.map((debt, index) => (
                    <motion.div key={debt.type} variants={itemAnimation}>
                      <Card className="border-slate-200 dark:border-slate-800 overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">{debt.icon}</div>
                              <div>
                                <h4 className="font-medium">{debt.name}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                    {formatCurrency(debt.balance)}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {debt.interestRate}% {translate("debt.interest_rate")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={debt.priority === "high" ? "destructive" : "outline"}
                              className={
                                debt.priority === "high"
                                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                              }
                            >
                              {debt.priority === "high"
                                ? translate("debt.high_priority")
                                : translate("debt.medium_priority")}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={staggerItems} initial="hidden" animate="visible">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold border-b pb-2 text-rose-700 dark:text-rose-400">
                    {translate("debt.steps_to_reduce")}
                  </h2>

                  <motion.div variants={itemAnimation} className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20">
                      <div className="bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">
                          {translate("debt.prioritize_your_debts")}
                        </p>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
                          {translate("debt.focus_first_credit_card")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20">
                      <div className="bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">
                          {translate("debt.minimum_payment_on_all")}
                        </p>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
                          {translate("debt.make_minimum_payment")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20">
                      <div className="bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">
                          {translate("debt.extra_payments_to_priority")}
                        </p>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
                          {translate("debt.allocate_extra_money")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-900/10 rounded-lg border border-rose-100 dark:border-rose-900/20">
                      <div className="bg-rose-100 dark:bg-rose-800 text-rose-700 dark:text-rose-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5 flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-semibold text-rose-700 dark:text-rose-300">
                          {translate("debt.move_to_the_next")}
                        </p>
                        <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
                          {translate("debt.once_first_debt_paid")}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={fadeIn}
              className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-lg border border-rose-100 dark:border-rose-900/20"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 dark:bg-rose-800 rounded-full">
                  <TrendingDown className="h-5 w-5 text-rose-600 dark:text-rose-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-rose-700 dark:text-rose-300">
                    {translate("debt.strategy_recommendation")}
                  </h3>
                  <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-1">
                    {translate("debt.snowball_method")}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>

          <CardFooter className="flex justify-between pt-4 border-t bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <Button variant="outline" onClick={() => router.push("/ai-insights")}>
              {translate("common.cancel")}
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700">
              {translate("debt.create_payment_strategy")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <div className="flex justify-center">
        <Button onClick={() => router.push("/ai-insights")} variant="ghost" className="mx-auto">
          {translate("common.back_to_advice")}
        </Button>
      </div>
    </motion.div>
  )
}
