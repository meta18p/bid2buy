import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Bid {
  id: string
  amount: number
  createdAt: Date
  product: {
    id: string
    title: string
    currentPrice: number
    endTime: Date
    status: string
  }
}

interface BidsListProps {
  bids: Bid[]
}

export default function BidsList({ bids }: BidsListProps) {
  if (bids.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-muted-foreground">You haven&apos;t placed any bids yet.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Your Bid</TableHead>
            <TableHead>Current Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bids.map((bid) => {
            const isWinning = bid.product.currentPrice === bid.amount
            const isEnded = new Date(bid.product.endTime) < new Date() || bid.product.status === "ENDED"
            const status = getBidStatus(bid, isWinning, isEnded)

            return (
              <TableRow key={bid.id}>
                <TableCell>{new Date(bid.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link href={`/auction/${bid.product.id}`} className="hover:underline font-medium">
                    {bid.product.title}
                  </Link>
                </TableCell>
                <TableCell>{formatCurrency(bid.amount)}</TableCell>
                <TableCell>{formatCurrency(bid.product.currentPrice)}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(status)}>{status}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function getBidStatus(bid: Bid, isWinning: boolean, isEnded: boolean) {
  if (bid.product.status === "CANCELLED") return "Cancelled"
  if (isEnded && isWinning) return "Won"
  if (isEnded && !isWinning) return "Lost"
  if (isWinning) return "Winning"
  return "Outbid"
}

function getBadgeVariant(status: string) {
  switch (status) {
    case "Won":
      return "default"
    case "Winning":
      return "default"
    case "Outbid":
      return "secondary"
    case "Lost":
      return "outline"
    case "Cancelled":
      return "destructive"
    default:
      return "default"
  }
}
