import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency, calculateTimeLeft } from "@/lib/utils"
import { Clock, Tag, User, Video, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductCardProps {
  product: any
}

export default function ProductCard({ product }: ProductCardProps) {
  const timeLeft = calculateTimeLeft(product.endTime)
  const isEnded = timeLeft.isEnded || product.status === "ENDED"
  const hasVideo = product.mediaType === "video"

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="aspect-square relative">
        <img
          src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
          alt={product.title}
          className="object-cover w-full h-full"
        />

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.aiVerified && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-green-500 text-white p-1 rounded-full">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Verified Product</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {hasVideo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-blue-500 text-white p-1 rounded-full">
                    <Video className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Video Available</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {isEnded && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Auction Ended
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-grow">
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
            {isEnded ? (
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
      <CardFooter className="p-4 pt-0 flex justify-between items-center border-t mt-auto">
        <div>
          <p className="text-sm text-muted-foreground">Current Bid</p>
          <p className="font-semibold text-lg">{formatCurrency(product.currentPrice)}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{product._count?.bids || 0}</span> bids
        </div>
      </CardFooter>
    </Card>
  )
}
