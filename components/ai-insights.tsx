"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/context/settings-context"
import { useState } from "react"
import { motion } from "framer-motion"
import { FinancialAdviceHub } from "@/components/financial-advice-hub"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Search,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  PieChart,
  LineChart,
  Lightbulb,
  Sparkles,
} from "lucide-react"

export function AIInsights() {
  const { translate, formatCurrency } = useSettings()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("predictions")

  // Datos de ejemplo para las predicciones
  const predictions = {
    nextMonthIncome: 3500,
    nextMonthExpenses: 2800,
    savingsRate: 20,
    confidenceScore: 85,
    categories: [
      { name: translate("category.housing"), amount: 1200, percentage: 43 },
      { name: translate("category.food"), amount: 500, percentage: 18 },
      { name: translate("category.transportation"), amount: 300, percentage: 11 },
      { name: translate("category.entertainment"), amount: 200, percentage: 7 },
      { name: translate("category.utilities"), amount: 150, percentage: 5 },
      { name: translate("category.savings"), amount: 700, percentage: 20 },
      { name: translate("category.other"), amount: 450, percentage: 16 },
    ],
  }

  // Datos de ejemplo para anomalías
  const anomalies = [
    {
      category: translate("category.entertainment"),
      currentSpending: 350,
      averageSpending: 200,
      percentageIncrease: 75,
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    },
  ]

  // Datos de ejemplo para objetivos de ahorro
  const savingsGoal = {
    recommended: 700,
    current: 500,
    percentage: 71,
    ofIncome: 20,
  }

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {translate("ai.title")}
          </h1>
          <p className="text-muted-foreground">{translate("ai.data_analysis_explanation")}</p>
        </div>
      </motion.div>

      <Tabs defaultValue="predictions" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="predictions" className="data-[state=active]:bg-background">
              {translate("ai.predictions")}
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="data-[state=active]:bg-background">
              {translate("ai.anomalies")}
            </TabsTrigger>
            <TabsTrigger value="savings" className="data-[state=active]:bg-background">
              {translate("ai.savings")}
            </TabsTrigger>
            <TabsTrigger value="advice" className="data-[state=active]:bg-background">
              {translate("ai.insights")}
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`${translate("ai.search_insights")}...`}
              className="pl-8 w-full sm:w-[250px] bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="predictions" className="space-y-8 mt-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-medium">{translate("ai.income_expense_forecast")}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
                    >
                      {translate("ai.next_month")}
                    </Badge>
                  </div>
                  <CardDescription>{translate("ai.based_on_history")}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-medium">{translate("ai.predicted_income")}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(predictions.nextMonthIncome)}</span>
                      </div>
                      <Progress value={100} className="h-2 bg-emerald-100 dark:bg-emerald-900/20" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-rose-500" />
                          <span className="text-sm font-medium">{translate("ai.predicted_expenses")}</span>
                        </div>
                        <span className="font-medium">{formatCurrency(predictions.nextMonthExpenses)}</span>
                      </div>
                      <Progress
                        value={(predictions.nextMonthExpenses / predictions.nextMonthIncome) * 100}
                        className="h-2 bg-rose-100 dark:bg-rose-900/20"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">{translate("budget.savings_rate")}</span>
                        </div>
                        <span className="font-medium">{predictions.savingsRate}%</span>
                      </div>
                      <Progress value={predictions.savingsRate} className="h-2 bg-blue-100 dark:bg-blue-900/20" />
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{translate("ai.prediction_confidence")}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                        >
                          {predictions.confidenceScore}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">{translate("ai.predicted_categories")}</CardTitle>
                  <CardDescription>{translate("dashboard.distribution_by_category")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictions.categories.slice(0, 5).map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{formatCurrency(category.amount)}</span>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800/30"
                            >
                              {category.percentage}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}

                    <div className="pt-2">
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        {translate("dashboard.view_all")}
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg font-medium">{translate("ai.next_months_forecast")}</CardTitle>
                </div>
                <CardDescription>{translate("ai.three_month_projection")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center bg-muted/40 rounded-md">
                  <p className="text-muted-foreground">{translate("dashboard.chart_placeholder")}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-8 mt-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg font-medium">{translate("ai.spending_anomalies")}</CardTitle>
                </div>
                <CardDescription>{translate("ai.unusual_patterns")}</CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies.length > 0 ? (
                  <div className="space-y-6">
                    {anomalies.map((anomaly, index) => (
                      <motion.div key={index} variants={fadeIn} className="space-y-4">
                        <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">{anomaly.icon}</div>
                          <div className="space-y-2">
                            <h3 className="font-medium text-amber-800 dark:text-amber-300">
                              {anomaly.category} {translate("anomaly.spending_higher")}
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              {translate("anomaly.spending_explanation", {
                                percentage: anomaly.percentageIncrease,
                              })}
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div>
                                <p className="text-xs text-muted-foreground">{translate("ai.current_spending")}</p>
                                <p className="font-medium">{formatCurrency(anomaly.currentSpending)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">{translate("ai.average_spending")}</p>
                                <p className="font-medium">{formatCurrency(anomaly.averageSpending)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    <div className="pt-2">
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        {translate("ai.analyze_spending")}
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full mb-4">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">{translate("ai.no_anomalies")}</h3>
                    <p className="text-muted-foreground max-w-md">{translate("ai.consistent_patterns")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-8 mt-6">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-medium">{translate("ai.savings_goal")}</CardTitle>
                </div>
                <CardDescription>{translate("ai.savings_recommendation")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{translate("ai.recommended_amount")}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">{formatCurrency(savingsGoal.recommended)}</span>
                        <span className="text-muted-foreground">{translate("ai.per_month")}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {savingsGoal.ofIncome}% {translate("ai.of_income")}
                      </p>
                    </div>

                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">{translate("ai.current_savings")}</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(savingsGoal.current)} ({savingsGoal.percentage}% {translate("ai.of_goal")})
                        </p>
                      </div>
                      <Progress value={savingsGoal.percentage} className="h-2" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">{translate("ai.potential_savings")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">
                              {translate("ai.budget_optimization")}
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                              {translate("ai.budget_explanation")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="font-medium text-emerald-800 dark:text-emerald-300">
                              {translate("ai.investment_recommendation")}
                            </p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                              {translate("ai.investment_explanation")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="advice" className="mt-6">
          <FinancialAdviceHub />
        </TabsContent>
      </Tabs>
    </div>
  )
}
