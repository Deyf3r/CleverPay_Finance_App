"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PieChart, TrendingUp, ShieldCheck, Wallet, CreditCard, ChevronRight, LineChart } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { useFinance } from "@/context/finance-context"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function FinancialAdviceHub() {
  const { translate, formatCurrency } = useSettings()
  const { state, isLoading, getTotalIncome, getTotalExpenses, getSavingsRate } = useFinance()
  const router = useRouter()
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [financialData, setFinancialData] = useState({
    monthlyIncome: 3500,
    recommendedSavings: 700,
    currentSavings: 5000,
    monthlyExpenses: 2500,
    emergencyFundTarget: {
      min: 7500,
      max: 15000
    },
    currentEmergencyFund: 0,
    recommendedInvestment: 200,
    debtInfo: {
      creditCard: { amount: 3500, interestRate: 18 },
      personalLoan: { amount: 5000, interestRate: 8 }
    }
  })

  // Calcular datos financieros basados en transacciones reales
  useEffect(() => {
    if (isLoading) return
    
    // Calcular ingresos mensuales
    const totalIncome = getTotalIncome()
    const monthlyIncome = totalIncome / Math.max(1, state.transactions.filter(t => t.type === "income").length) * 4
    
    // Calcular gastos mensuales
    const totalExpenses = getTotalExpenses()
    const monthlyExpenses = totalExpenses / Math.max(1, state.transactions.filter(t => t.type === "expense").length) * 4
    
    // Calcular ahorros recomendados (20% de los ingresos)
    const recommendedSavings = monthlyIncome * 0.2
    
    // Calcular ahorros actuales (saldo total en cuentas de ahorro)
    const currentSavings = state.accounts.savings?.balance || 0
    
    // Calcular objetivo de fondo de emergencia (3-6 meses de gastos)
    const emergencyFundTarget = {
      min: monthlyExpenses * 3,
      max: monthlyExpenses * 6
    }
    
    // Calcular fondo de emergencia actual
    const currentEmergencyFund = state.accounts.savings?.balance || 0
    
    // Calcular inversión recomendada (5-10% de los ingresos)
    const recommendedInvestment = monthlyIncome * 0.05
    
    // Obtener información de deudas
    const debtInfo = {
      creditCard: { 
        amount: Math.abs(state.accounts.credit?.balance || 3500), 
        interestRate: 18 
      },
      personalLoan: { 
        amount: 5000, // Valor por defecto si no hay datos reales
        interestRate: 8 
      }
    }
    
    setFinancialData({
      monthlyIncome,
      recommendedSavings,
      currentSavings,
      monthlyExpenses,
      emergencyFundTarget,
      currentEmergencyFund,
      recommendedInvestment,
      debtInfo
    })
    
  }, [isLoading, state.transactions, state.accounts, getTotalIncome, getTotalExpenses])

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
      },
    },
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {translate("tips.financial_tips")}
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setActiveCard("budget")}
          onHoverEnd={() => setActiveCard(null)}
        >
          <Card
            className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/5 dark:to-indigo-900/5 cursor-pointer"
            onClick={() => navigateTo("/budget-planner")}
          >
            <CardHeader className="pb-3 border-b border-blue-100/50 dark:border-blue-900/10 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/10 dark:to-indigo-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20">
                  <PieChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{translate("tips.diversify_spending")}</CardTitle>
                  <CardDescription>{translate("tips.budget_explanation")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("category.housing")}</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                  >
                    30%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("category.food")}</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                  >
                    15%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("category.transportation")}</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                  >
                    10%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("category.entertainment")}</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
                  >
                    5%
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-blue-100/50 dark:border-blue-900/10 pt-3">
              <Button
                className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white group ${activeCard === "budget" ? "translate-y-0" : ""}`}
              >
                Crear Presupuesto
                <ChevronRight
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === "budget" ? "translate-x-1" : ""}`}
                />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setActiveCard("investment")}
          onHoverEnd={() => setActiveCard(null)}
        >
          <Card
            className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/5 dark:to-teal-900/5 cursor-pointer"
            onClick={() => navigateTo("/investments")}
          >
            <CardHeader className="pb-3 border-b border-emerald-100/50 dark:border-emerald-900/10 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                  <LineChart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{translate("tips.investment_opportunity")}</CardTitle>
                  <CardDescription>{translate("tips.investment_explanation")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.current_savings")}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(financialData.currentSavings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.recommended_amount")}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(financialData.recommendedInvestment)} / {translate("ai.per_month")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.investment_type")}</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                  >
                    {translate("ai.index_fund")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.time_horizon")}</span>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                  >
                    {translate("ai.long_term")}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-emerald-100/50 dark:border-emerald-900/10 pt-3">
              <Button
                className={`w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white group ${activeCard === "investment" ? "translate-y-0" : ""}`}
              >
                Explorar Inversiones
                <ChevronRight
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === "investment" ? "translate-x-1" : ""}`}
                />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setActiveCard("emergency")}
          onHoverEnd={() => setActiveCard(null)}
        >
          <Card
            className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5 cursor-pointer"
            onClick={() => navigateTo("/emergency-fund")}
          >
            <CardHeader className="pb-3 border-b border-amber-100/50 dark:border-amber-900/10 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-900/10 dark:to-orange-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{translate("tips.emergency_fund")}</CardTitle>
                  <CardDescription>{translate("tips.emergency_explanation")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("dashboard.monthly_expenses")}</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{formatCurrency(financialData.monthlyExpenses)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.recommended_amount")}</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    {formatCurrency(financialData.emergencyFundTarget.min)} - {formatCurrency(financialData.emergencyFundTarget.max)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.current_savings")}</span>
                  <span className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(financialData.currentEmergencyFund)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.goal_timeline")}</span>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                  >
                    6-12 {translate("ai.months")}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-amber-100/50 dark:border-amber-900/10 pt-3">
              <Button
                className={`w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white group ${activeCard === "emergency" ? "translate-y-0" : ""}`}
              >
                Comenzar a Ahorrar
                <ChevronRight
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === "emergency" ? "translate-x-1" : ""}`}
                />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          whileHover="hover"
          onHoverStart={() => setActiveCard("automate")}
          onHoverEnd={() => setActiveCard(null)}
        >
          <Card
            className="h-full overflow-hidden border-0 shadow-lg bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/5 dark:to-violet-900/5 cursor-pointer"
            onClick={() => navigateTo("/automate-savings")}
          >
            <CardHeader className="pb-3 border-b border-purple-100/50 dark:border-purple-900/10 bg-gradient-to-r from-purple-50/80 to-violet-50/80 dark:from-purple-900/10 dark:to-violet-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20">
                  <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">{translate("tips.automate_savings")}</CardTitle>
                  <CardDescription>{translate("tips.automation_explanation")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("dashboard.income")}</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(financialData.monthlyIncome)} / {translate("ai.per_month")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("ai.recommended_amount")}</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(financialData.recommendedSavings)} / {translate("ai.per_month")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("budget.savings_rate")}</span>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
                  >
                    10%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("accounts.from_account")}</span>
                  <span className="font-medium">{translate("account.checking")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-purple-100/50 dark:border-purple-900/10 pt-3">
              <Button
                className={`w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white group ${activeCard === "automate" ? "translate-y-0" : ""}`}
              >
                Configurar Automatización
                <ChevronRight
                  className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === "automate" ? "translate-x-1" : ""}`}
                />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      <motion.div
        custom={4}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover="hover"
        onHoverStart={() => setActiveCard("debt")}
        onHoverEnd={() => setActiveCard(null)}
      >
        <Card
          className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-900/5 dark:to-pink-900/5 cursor-pointer"
          onClick={() => navigateTo("/debt-planner")}
        >
          <CardHeader className="pb-3 border-b border-rose-100/50 dark:border-rose-900/10 bg-gradient-to-r from-rose-50/80 to-pink-50/80 dark:from-rose-900/10 dark:to-pink-900/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20">
                <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-lg">{translate("tips.reduce_debt")}</CardTitle>
                <CardDescription>{translate("tips.debt_explanation")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-base">{translate("debt.your_debts")}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                    >
                      {translate("debt.high_priority")}
                    </Badge>
                    <span className="text-sm font-medium">{translate("debt.credit_card")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-rose-600 dark:text-rose-400">{formatCurrency(financialData.debtInfo.creditCard.amount)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {financialData.debtInfo.creditCard.interestRate}% {translate("debt.interest_rate")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                    >
                      {translate("debt.medium_priority")}
                    </Badge>
                    <span className="text-sm font-medium">{translate("debt.personal_loan")}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-amber-600 dark:text-amber-400">{formatCurrency(financialData.debtInfo.personalLoan.amount)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      {financialData.debtInfo.personalLoan.interestRate}% {translate("debt.interest_rate")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-base">{translate("debt.steps_to_reduce")}</h3>
                <div className="space-y-5">
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{translate("debt.prioritize")}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {translate("debt.focus_highest_interest")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{translate("debt.minimum_payments")}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {translate("debt.make_minimum")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{translate("debt.extra_payments")}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {translate("debt.allocate_extra")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-1">{translate("debt.move_to_next")}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          {translate("debt.after_paying_first")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-rose-100/50 dark:border-rose-900/10 pt-3">
            <Button
              className={`w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white group ${activeCard === "debt" ? "translate-y-0" : ""}`}
            >
              Crear Estrategia
              <ChevronRight
                className={`ml-2 h-4 w-4 transition-transform duration-300 ${activeCard === "debt" ? "translate-x-1" : ""}`}
              />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
