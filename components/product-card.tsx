import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency, calculateTimeLeft } from "@/lib/utils"
import { Clock, Tag, User } from "lucide-react"

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const timeLeft = calculateTimeLeft(product.endTime)

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
          alt={product.title}
          className="object-cover w-full h-full"
        />
        {product.aiVerified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">AI Verified</div>
        )}
      </div>
      <CardContent className="p-4">
        <Link href={`/auction/${product.id}`}>
          <h3 className="font-semibold text-lg truncate hover:underline">{product.title}</h3>
        </Link>
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <User className="h-4 w-4 mr-1" />
          <span>{product.seller?.name || "Unknown Seller"}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Tag className="h-4 w-4 mr-1" />
            <span>{product.category}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            {timeLeft.isEnded ? (
              <span className="text-red-500">Ended</span>
            ) : (
              <span>
                {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
                {timeLeft.hours}h {timeLeft.minutes}m
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Current Bid</p>
          <p className="font-semibold text-lg">{formatCurrency(product.currentPrice)}</p>
        </div>
        <div className="text-sm text-muted-foreground">{product._count?.bids || 0} bids</div>
      </CardFooter>
    </Card>
  )
}
