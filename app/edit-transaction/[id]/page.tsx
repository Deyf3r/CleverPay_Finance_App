import NavBar from "@/components/nav-bar"
import TransactionForm from "@/components/transaction-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditTransactionPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Edit Transaction</h2>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>Update the details of your transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionForm transactionId={params.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

