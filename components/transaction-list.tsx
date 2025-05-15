import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string
  createdAt: Date
}

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(transaction.type)}>{transaction.type}</Badge>
              </TableCell>
              <TableCell className={`text-right ${getAmountColor(transaction.amount)}`}>
                {formatCurrency(transaction.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function getBadgeVariant(type: string) {
  switch (type) {
    case "DEPOSIT":
      return "default"
    case "WITHDRAWAL":
      return "outline"
    case "BID":
      return "secondary"
    case "REFUND":
      return "success"
    default:
      return "default"
  }
}

function getAmountColor(amount: number) {
  return amount >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
}
