import { getWalletBalance, getTransactions } from "@/app/actions/wallet-actions"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AddFundsForm from "@/components/add-funds-form"
import TransactionList from "@/components/transaction-list"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function WalletPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const balance = await getWalletBalance()
  const transactions = await getTransactions()

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Wallet</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatCurrency(balance || 0)}</div>
            <p className="text-sm text-muted-foreground mt-2">
              You need at least 50% of your bid amount in your wallet to place a bid.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>Add funds to your wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <AddFundsForm />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Transactions</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="refunds">Refunds</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <TransactionList transactions={transactions} />
          </TabsContent>
          <TabsContent value="deposits" className="mt-4">
            <TransactionList transactions={transactions.filter((t) => t.type === "DEPOSIT")} />
          </TabsContent>
          <TabsContent value="bids" className="mt-4">
            <TransactionList transactions={transactions.filter((t) => t.type === "BID")} />
          </TabsContent>
          <TabsContent value="refunds" className="mt-4">
            <TransactionList transactions={transactions.filter((t) => t.type === "REFUND")} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
