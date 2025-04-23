"use client"

import { useState } from "react"
import { ArrowLeft, Wallet, PiggyBank, Calendar, ArrowRight, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSettings } from "@/context/settings-context"
import { useFinance } from "@/context/finance-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"

export default function AutomateSavingsPage() {
  const router = useRouter()
  const { formatCurrency, translate } = useSettings()
  const { state } = useFinance()
  const [selectedAccount, setSelectedAccount] = useState("")
  const [amount, setAmount] = useState("350")
  const [frequency, setFrequency] = useState("monthly")
  const [targetGoal, setTargetGoal] = useState("emergency_fund")
  const [autoAdjust, setAutoAdjust] = useState(true)

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

  // Goals options
  const goalOptions = [
    { id: "emergency_fund", name: translate("goals.emergency_fund"), target: 10000 },
    { id: "vacation", name: translate("goals.vacation"), target: 3000 },
    { id: "down_payment", name: translate("goals.down_payment"), target: 25000 },
    { id: "retirement", name: translate("goals.retirement"), target: 100000 },
    { id: "education", name: translate("goals.education"), target: 15000 },
  ]

  // Map frequencies to days
  const frequencyMap: Record<string, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
  }

  const handleSetupAutomation = () => {
    // Implement saving automation setup
    const selectedGoal = goalOptions.find((goal) => goal.id === targetGoal)
    const savingDays = frequencyMap[frequency] || 30
    const amountValue = Number.parseFloat(amount) || 0

    // Calculate estimated time to reach goal
    const daysToGoal = (selectedGoal ? selectedGoal.target : 10000) / (amountValue / savingDays)
    const monthsToGoal = daysToGoal / 30

    // Show success message
    router.push("/dashboard?notification=automation-setup-success")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/ai-insights")} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              {translate("tips.automate_savings")}
            </h1>
            <p className="text-muted-foreground">{translate("automation.subtitle")}</p>
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

      <motion.div
        className="grid gap-6 md:grid-cols-3 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-900/5 dark:to-violet-900/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500/20 to-violet-500/20">
                  <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>{translate("automation.setup_autosave")}</CardTitle>
                  <CardDescription>{translate("automation.setup_description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="from-account">{translate("accounts.from_account")}</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
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
                <Label htmlFor="amount">{translate("accounts.amount")}</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
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
                <Label htmlFor="frequency">{translate("automation.frequency")}</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency">
                    <SelectValue placeholder={translate("automation.select_frequency")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">{translate("automation.weekly")}</SelectItem>
                    <SelectItem value="biweekly">{translate("automation.biweekly")}</SelectItem>
                    <SelectItem value="monthly">{translate("automation.monthly")}</SelectItem>
                    <SelectItem value="quarterly">{translate("automation.quarterly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-goal">{translate("automation.target_goal")}</Label>
                <Select value={targetGoal} onValueChange={setTargetGoal}>
                  <SelectTrigger id="target-goal">
                    <SelectValue placeholder={translate("automation.select_goal")} />
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name} ({formatCurrency(goal.target)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-adjust">{translate("automation.auto_adjust")}</Label>
                  <p className="text-sm text-muted-foreground">{translate("automation.auto_adjust_description")}</p>
                </div>
                <Switch id="auto-adjust" checked={autoAdjust} onCheckedChange={setAutoAdjust} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle>{translate("automation.summary")}</CardTitle>
              <CardDescription>{translate("automation.estimated_results")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("automation.monthly_saving")}</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(
                      frequency === "weekly"
                        ? Number.parseFloat(amount) * 4.33
                        : frequency === "biweekly"
                          ? Number.parseFloat(amount) * 2.17
                          : frequency === "quarterly"
                            ? Number.parseFloat(amount) / 3
                            : Number.parseFloat(amount),
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("automation.yearly_saving")}</span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {formatCurrency(
                      frequency === "weekly"
                        ? Number.parseFloat(amount) * 52
                        : frequency === "biweekly"
                          ? Number.parseFloat(amount) * 26
                          : frequency === "monthly"
                            ? Number.parseFloat(amount) * 12
                            : Number.parseFloat(amount) * 4,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("automation.goal_target")}</span>
                  <span className="font-medium">
                    {formatCurrency(goalOptions.find((goal) => goal.id === targetGoal)?.target || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("automation.time_to_goal")}</span>
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800/30"
                  >
                    {Math.ceil(
                      (goalOptions.find((goal) => goal.id === targetGoal)?.target || 10000) /
                        (frequency === "weekly"
                          ? Number.parseFloat(amount) * 4.33
                          : frequency === "biweekly"
                            ? Number.parseFloat(amount) * 2.17
                            : frequency === "quarterly"
                              ? Number.parseFloat(amount) / 3
                              : Number.parseFloat(amount)),
                    )}{" "}
                    {translate("ai.months")}
                  </Badge>
                </div>
              </div>

              <div className="p-4 border border-purple-200 dark:border-purple-800/30 rounded-lg bg-white dark:bg-black/20">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 flex-shrink-0">
                    <PiggyBank className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">{translate("automation.benefit_title")}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {translate("automation.benefit_description")}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white"
                onClick={handleSetupAutomation}
              >
                {translate("automation.setup_autosave")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-md mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-blue-500/20">
                  <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle>{translate("automation.tips_title")}</CardTitle>
                  <CardDescription>{translate("automation.tips_description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">{translate("automation.tip_1_title")}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {translate("automation.tip_1_description")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">{translate("automation.tip_2_title")}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {translate("automation.tip_2_description")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">{translate("automation.tip_3_title")}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {translate("automation.tip_3_description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
