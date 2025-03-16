import NavBar from "@/components/nav-bar"
import TransactionForm from "@/components/transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddTransactionPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Add Transaction</h2>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Enter the details of your new transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

