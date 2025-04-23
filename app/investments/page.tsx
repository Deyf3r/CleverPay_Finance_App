"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Wallet,
  LineChart,
  TrendingUp,
  BarChart4,
  ArrowRight,
  LayoutDashboard,
  PieChart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"

export default function InvestmentsPage() {
  const router = useRouter()
  const { formatCurrency, translate } = useSettings()
  const [activeTab, setActiveTab] = useState("overview")

  // Datos de ejemplo para inversiones
  const investments = [
    {
      name: translate("investments.stock_fund"),
      value: 3500,
      allocation: 40,
      return: 12.5,
      risk: "medium",
    },
    {
      name: translate("investments.bond_fund"),
      value: 2500,
      allocation: 30,
      return: 4.2,
      risk: "low",
    },
    {
      name: translate("investments.real_estate"),
      value: 1500,
      allocation: 20,
      return: 8.7,
      risk: "medium",
    },
    {
      name: translate("investments.cash"),
      value: 750,
      allocation: 10,
      return: 1.5,
      risk: "very_low",
    },
  ]

  const totalInvestment = investments.reduce((sum, inv) => sum + inv.value, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "very_low":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800/30"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
      case "high":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800/30"
      case "very_high":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800/30"
    }
  }

  const getAllocationColor = (index: number) => {
    const colors = [
      "bg-purple-500 dark:bg-purple-600",
      "bg-blue-500 dark:bg-blue-600",
      "bg-emerald-500 dark:bg-emerald-600",
      "bg-amber-500 dark:bg-amber-600",
      "bg-rose-500 dark:bg-rose-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/ai-insights")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {translate("investments.title")}
            </h1>
            <p className="text-muted-foreground">{translate("investments.subtitle")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <motion.div className="grid gap-6 mb-8" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/5 dark:to-teal-900/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle>{translate("investments.portfolio_summary")}</CardTitle>
                  <CardDescription>{translate("investments.current_investments")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{translate("investments.total_value")}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalInvestment)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(350)}</span> (
                    {translate("investments.this_month")})
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{translate("investments.average_return")}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">8.2%</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400">+1.2%</span> (
                    {translate("investments.last_year")})
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{translate("investments.projected_value")}</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(12500)}</p>
                  <p className="text-sm text-muted-foreground">{translate("investments.in_years", { years: 5 })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart4 className="h-4 w-4" />
              {translate("investments.overview")}
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              {translate("dashboard.allocation")}
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              {translate("dashboard.performance")}
            </TabsTrigger>
          </TabsList>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={activeTab === "overview" ? "visible" : "hidden"}
          >
            <TabsContent value="overview" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{translate("investments.your_investments")}</CardTitle>
                    <CardDescription>{translate("investments.current_holdings")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {investments.map((investment, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getRiskColor(investment.risk)}>
                                {translate(`investments.risk.${investment.risk}`)}
                              </Badge>
                              <span className="font-medium">{investment.name}</span>
                            </div>
                            <span className="font-medium">{formatCurrency(investment.value)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{investment.allocation}%</span>
                            <span className="text-emerald-600 dark:text-emerald-400">+{investment.return}%</span>
                          </div>
                          <Progress
                            value={investment.allocation}
                            max={100}
                            className="h-2"
                            indicatorClassName={getAllocationColor(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={() => setActiveTab("allocation")}
                    >
                      {translate("investments.view_allocation")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={activeTab === "allocation" ? "visible" : "hidden"}
          >
            <TabsContent value="allocation" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{translate("dashboard.allocation")}</CardTitle>
                    <CardDescription>{translate("investments.portfolio_distribution")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center py-6">
                      <div className="w-64 h-64 rounded-full border-8 border-background relative flex items-center justify-center overflow-hidden">
                        {investments.map((investment, index) => {
                          const previousSum = investments.slice(0, index).reduce((sum, inv) => sum + inv.allocation, 0)

                          return (
                            <div
                              key={index}
                              className={`absolute top-0 left-0 w-full h-full ${getAllocationColor(index)}`}
                              style={{
                                clipPath: `conic-gradient(from 0deg, transparent ${previousSum}%, transparent ${previousSum}%, currentColor ${previousSum + investment.allocation}%, transparent ${previousSum + investment.allocation}%)`,
                              }}
                            />
                          )
                        })}
                        <div className="w-3/5 h-3/5 rounded-full bg-background z-10 flex items-center justify-center flex-col">
                          <span className="text-xs text-muted-foreground">{translate("investments.total")}</span>
                          <span className="text-xl font-bold">{formatCurrency(totalInvestment)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {investments.map((investment, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getAllocationColor(index)}`} />
                          <span className="text-sm">{investment.name}</span>
                          <span className="text-sm ml-auto">{investment.allocation}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={() => setActiveTab("performance")}
                    >
                      {translate("investments.view_performance")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={activeTab === "performance" ? "visible" : "hidden"}
          >
            <TabsContent value="performance" className="space-y-6">
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>{translate("dashboard.performance")}</CardTitle>
                    <CardDescription>{translate("investments.historical_returns")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end justify-between gap-2 mt-6 mb-1 px-2">
                      {[5, 8, 3, 12, 7, 9, 15, 6, 11, 14, 10, 12].map((value, index) => (
                        <div key={index} className="h-full flex-1 flex flex-col justify-end items-center gap-1">
                          <div
                            className="w-full bg-gradient-to-t from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-t-sm"
                            style={{ height: `${value * 5}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month, idx) => (
                          <div key={idx} className="flex-1 text-center">
                            {month}
                          </div>
                        ),
                      )}
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translate("investments.ytd_return")}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                        >
                          +8.2%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translate("investments.one_year_return")}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                        >
                          +12.5%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translate("investments.three_year_return")}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                        >
                          +28.7%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{translate("investments.five_year_return")}</span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
                        >
                          +42.3%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      onClick={() => setActiveTab("overview")}
                    >
                      {translate("investments.back_to_overview")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </TabsContent>
          </motion.div>
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-md mb-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/5 dark:to-orange-900/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle>{translate("investments.opportunities")}</CardTitle>
                <CardDescription>{translate("investments.personalized_recommendations")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-amber-200 dark:border-amber-800/30 rounded-lg bg-white dark:bg-black/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-800 dark:text-amber-400">
                    {translate("investments.index_fund_recommendation")}
                  </span>
                  <Badge variant="outline" className={getRiskColor("low")}>
                    {translate("investments.risk.low")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {translate("investments.index_fund_description")}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{translate("investments.expected_return")}: 7-9%</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {translate("investments.recommended_allocation")}: 40%
                  </span>
                </div>
              </div>

              <div className="p-4 border border-amber-200 dark:border-amber-800/30 rounded-lg bg-white dark:bg-black/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-amber-800 dark:text-amber-400">
                    {translate("investments.dividend_stocks")}
                  </span>
                  <Badge variant="outline" className={getRiskColor("medium")}>
                    {translate("investments.risk.medium")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {translate("investments.dividend_description")}
                </p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{translate("investments.expected_return")}: 4-6%</span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {translate("investments.recommended_allocation")}: 30%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white">
              {translate("investments.explore_recommendations")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
