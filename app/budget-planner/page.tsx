"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PieChart, ArrowLeft, Plus, Trash2, DollarSign, Percent, Save, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { Badge } from "@/components/ui/badge"

interface Category {
  name: string
  percentage: number
  amount: number
  suggested: number
}

export default function BudgetPlannerPage() {
  const router = useRouter()
  const { translate, formatCurrency } = useSettings()
  const [activeTab, setActiveTab] = useState("overview")
  const [monthlyIncome, setMonthlyIncome] = useState("3500")
  const [savingsGoal, setSavingsGoal] = useState("20")

  // Sample budget data
  const [categories, setCategories] = useState<Category[]>([
    { name: translate("category.housing"), percentage: 30, amount: 1050, suggested: 1050 },
    { name: translate("category.food"), percentage: 15, amount: 525, suggested: 525 },
    { name: translate("category.transportation"), percentage: 10, amount: 350, suggested: 350 },
    { name: translate("category.utilities"), percentage: 10, amount: 350, suggested: 350 },
    { name: translate("category.entertainment"), percentage: 5, amount: 175, suggested: 175 },
    { name: translate("category.savings"), percentage: 20, amount: 700, suggested: 700 },
    { name: translate("category.other"), percentage: 10, amount: 350, suggested: 350 },
  ])

  const getProgressColor = (index: number) => {
    const colors = [
      "bg-purple-500 dark:bg-purple-600",
      "bg-blue-500 dark:bg-blue-600",
      "bg-emerald-500 dark:bg-emerald-600",
      "bg-amber-500 dark:bg-amber-600",
      "bg-rose-500 dark:bg-rose-600",
      "bg-indigo-500 dark:bg-indigo-600",
      "bg-teal-500 dark:bg-teal-600",
    ]
    return colors[index % colors.length]
  }

  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30",
      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30",
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30",
      "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30",
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30",
      "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400 border-teal-200 dark:border-teal-800/30",
    ]
    return colors[index % colors.length]
  }

  const handleCategoryChange = (index: number, field: keyof Category, value: string) => {
    const newCategories = [...categories]
    if (field === "name") {
      newCategories[index].name = value
    } else if (field === "percentage") {
      newCategories[index].percentage = parseFloat(value) || 0
      newCategories[index].amount = (parseFloat(monthlyIncome) * newCategories[index].percentage) / 100
    } else if (field === "amount") {
      newCategories[index].amount = parseFloat(value) || 0
      newCategories[index].percentage = (newCategories[index].amount / parseFloat(monthlyIncome)) * 100
    }
    setCategories(newCategories)
  }

  const handleMonthlyIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyIncome(e.target.value)
    const newCategories = [...categories]
    newCategories.forEach((category) => {
      category.amount = (parseFloat(e.target.value) * category.percentage) / 100
    })
    setCategories(newCategories)
  }

  const handleSavingsGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSavingsGoal(e.target.value)
    const newCategories = [...categories]
    newCategories.forEach((category) => {
      category.amount = (parseFloat(monthlyIncome) * category.percentage) / 100
    })
    setCategories(newCategories)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/ai-insights")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {translate("budget.title")}
            </h1>
            <p className="text-muted-foreground">{translate("budget.subtitle")}</p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          onClick={() => router.push("/ai-insights")}
        >
          <Save className="mr-2 h-4 w-4" />
          Guardar Presupuesto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{translate("budget.monthly_income")}</CardTitle>
            <CardDescription>{translate("budget.monthly_income_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={monthlyIncome}
                onChange={handleMonthlyIncomeChange}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{translate("budget.savings_goal")}</CardTitle>
            <CardDescription>{translate("budget.savings_goal_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={savingsGoal}
                onChange={handleSavingsGoalChange}
                className="font-mono"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{translate("budget.calculator")}</CardTitle>
            <CardDescription>{translate("budget.calculator_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{translate("budget.monthly_income")}:</span>
                <span className="font-mono">{formatCurrency(parseFloat(monthlyIncome))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{translate("budget.savings_goal")}:</span>
                <span className="font-mono">{formatCurrency((parseFloat(monthlyIncome) * parseFloat(savingsGoal)) / 100)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-sm">{translate("budget.disposable_income")}:</span>
                <span className="font-mono">
                  {formatCurrency(parseFloat(monthlyIncome) - (parseFloat(monthlyIncome) * parseFloat(savingsGoal)) / 100)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">{translate("budget.overview")}</TabsTrigger>
          <TabsTrigger value="detailed">{translate("budget.detailed")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{translate("budget.distribution")}</CardTitle>
              <CardDescription>{translate("budget.distribution_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="aspect-square max-w-sm mx-auto">
                  <PieChart className="w-full h-full text-muted-foreground" />
                </div>

                <div className="space-y-4">
                  {categories.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={getBadgeColor(index)}>
                          {category.name}
                        </Badge>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={category.percentage}
                          className="h-2"
                          indicatorClassName={getProgressColor(index + 4)}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(category.amount)}</span>
                          <span>
                            {translate("budget.suggested")}: {formatCurrency(category.suggested)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                onClick={() => setActiveTab("detailed")}
              >
                {translate("budget.customize")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{translate("budget.categories")}</CardTitle>
              <CardDescription>{translate("budget.categories_description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                  <div className="col-span-5">{translate("budget.category")}</div>
                  <div className="col-span-3">{translate("budget.percentage")}</div>
                  <div className="col-span-3">{translate("budget.amount")}</div>
                  <div className="col-span-1"></div>
                </div>

                {categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <Input
                        value={category.name}
                        onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        value={category.percentage.toString()}
                        onChange={(e) => handleCategoryChange(index, "percentage", e.target.value)}
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        value={category.amount.toString()}
                        onChange={(e) => handleCategoryChange(index, "amount", e.target.value)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {translate("budget.add_category")}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setActiveTab("overview")}>
                {translate("budget.back_to_overview")}
              </Button>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                {translate("budget.save_budget")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
