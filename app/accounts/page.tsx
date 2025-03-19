"use client"

import { useState } from "react"
import { useFinance } from "@/context/finance-context"
import { useSettings } from "@/context/settings-context"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AccountChart } from "@/components/account-chart"
import { AccountTransactions } from "@/components/account-transactions"
import { AccountSummary } from "@/components/account-summary"
import { TransferFunds } from "@/components/transfer-funds"
import {
  CreditCard,
  Wallet,
  Building,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pencil,
  RefreshCw,
  BarChart4,
} from "lucide-react"

export default function AccountsPage() {
  const { state } = useFinance()
  const { formatCurrency, translate } = useSettings()
  const [activeAccount, setActiveAccount] = useState("checking")
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newAccountName, setNewAccountName] = useState("")
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)

  // Función para obtener el icono de la cuenta
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
        return <Wallet className="h-5 w-5" />
    }
  }

  // Función para obtener el color de la cuenta
  const getAccountColor = (accountType: string) => {
    switch (accountType) {
      case "checking":
        return "bg-blue-500 dark:bg-blue-600"
      case "savings":
        return "bg-green-500 dark:bg-green-600"
      case "credit":
        return "bg-purple-500 dark:bg-purple-600"
      case "cash":
        return "bg-amber-500 dark:bg-amber-600"
      default:
        return "bg-gray-500 dark:bg-gray-600"
    }
  }

  // Calcular estadísticas de la cuenta activa
  const activeAccountTransactions = state.transactions.filter((t) => t.account === activeAccount)
  const incomeTransactions = activeAccountTransactions.filter((t) => t.type === "income")
  const expenseTransactions = activeAccountTransactions.filter((t) => t.type === "expense")

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

  const averageIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0

  const averageExpense = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0

  // Función para simular el cambio de nombre de la cuenta (en una app real, esto actualizaría la base de datos)
  const handleRenameAccount = () => {
    if (!newAccountName.trim()) {
      toast({
        title: translate("alert.error"),
        description: translate("accounts.enter_name"),
        variant: "destructive",
      })
      return
    }

    // Aquí iría la lógica para actualizar el nombre de la cuenta
    toast({
      title: translate("alert.success"),
      description: translate("accounts.renamed"),
    })
    setIsRenameDialogOpen(false)
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("accounts.title")}</h2>
          <div className="flex items-center gap-2">
            <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {translate("accounts.transfer")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translate("accounts.transfer_funds")}</DialogTitle>
                  <DialogDescription>{translate("accounts.transfer_description")}</DialogDescription>
                </DialogHeader>
                <TransferFunds onComplete={() => setIsTransferDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {translate("accounts.add_account")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(state.accounts).map(([accountType, account]) => (
            <Card
              key={accountType}
              className={`card overflow-hidden ${activeAccount === accountType ? "ring-2 ring-primary" : ""}`}
              onClick={() => setActiveAccount(accountType)}
            >
              <div className={`h-2 w-full ${getAccountColor(accountType)}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full p-1 ${getAccountColor(accountType)} bg-opacity-20 dark:bg-opacity-30`}>
                    {getAccountIcon(accountType)}
                  </div>
                  <CardTitle className="text-sm font-medium">{translate(`account.${accountType}`)}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
                <p className="text-xs text-muted-foreground">{account.name}</p>
              </CardContent>
              <CardFooter className="p-2 pt-0">
                <div className="flex w-full justify-between text-xs">
                  <div className="flex items-center text-emerald-500 dark:text-emerald-400">
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                    <span>
                      {formatCurrency(
                        state.transactions
                          .filter((t) => t.account === accountType && t.type === "income")
                          .reduce((sum, t) => sum + t.amount, 0),
                      )}
                    </span>
                  </div>
                  <div className="flex items-center text-rose-500 dark:text-rose-400">
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                    <span>
                      {formatCurrency(
                        state.transactions
                          .filter((t) => t.account === accountType && t.type === "expense")
                          .reduce((sum, t) => sum + t.amount, 0),
                      )}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="card md:col-span-2">
            <CardHeader>
              <CardTitle>{translate("accounts.account_activity")}</CardTitle>
              <CardDescription>{translate("accounts.activity_description")}</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <AccountChart accountType={activeAccount} />
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle>{translate("accounts.account_stats")}</CardTitle>
              <CardDescription>{translate("accounts.stats_description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("accounts.total_income")}</span>
                  <span className="font-medium text-emerald-500 dark:text-emerald-400">
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("accounts.total_expenses")}</span>
                  <span className="font-medium text-rose-500 dark:text-rose-400">{formatCurrency(totalExpenses)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("accounts.average_income")}</span>
                  <span className="font-medium">{formatCurrency(averageIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{translate("accounts.average_expense")}</span>
                  <span className="font-medium">{formatCurrency(averageExpense)}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{translate("accounts.transaction_count")}</span>
                  <span className="text-sm font-medium">{activeAccountTransactions.length}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, (incomeTransactions.length / Math.max(1, activeAccountTransactions.length)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {translate("accounts.income")}: {incomeTransactions.length}
                  </span>
                  <span>
                    {translate("accounts.expenses")}: {expenseTransactions.length}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <div className="flex items-center">
                  <BarChart4 className="mr-2 h-4 w-4" />
                  {translate("accounts.detailed_analytics")}
                </div>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">{translate("accounts.recent_transactions")}</TabsTrigger>
            <TabsTrigger value="summary">{translate("accounts.account_summary")}</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="space-y-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>{translate("accounts.recent_transactions")}</CardTitle>
                <CardDescription>{translate("accounts.recent_transactions_description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountTransactions accountType={activeAccount} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="summary" className="space-y-4">
            <Card className="card">
              <CardHeader>
                <CardTitle>{translate("accounts.account_summary")}</CardTitle>
                <CardDescription>{translate("accounts.summary_description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountSummary accountType={activeAccount} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Diálogo para renombrar cuenta */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{translate("accounts.rename_account")}</DialogTitle>
              <DialogDescription>{translate("accounts.rename_description")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">{translate("accounts.account_name")}</Label>
                <Input
                  id="name"
                  placeholder={translate("accounts.account_name_placeholder")}
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                {translate("accounts.cancel")}
              </Button>
              <Button onClick={handleRenameAccount}>{translate("accounts.save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

