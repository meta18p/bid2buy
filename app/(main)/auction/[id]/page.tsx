import { getProductById } from "@/app/actions/product-actions"
import { formatCurrency, calculateTimeLeft } from "@/lib/utils"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BidForm from "@/components/bid-form"
import AuctionTimer from "@/components/auction-timer"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import EndAuctionButton from "@/components/end-auction-button"

export default async function AuctionPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const timeLeft = calculateTimeLeft(product.endTime)
  const isOwner = session?.user?.id === product.sellerId
  const isEnded = timeLeft.isEnded || product.status !== "ACTIVE"
  const hasBids = product.bids.length > 0

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg mb-4">
            <img
              src={product.images[0] || "/placeholder.svg?height=600&width=600"}
              alt={product.title}
              className="object-cover w-full h-full"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image || `/placeholder.svg?height=150&width=150&text=Image ${index + 1}`}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{product.category}</Badge>
              <Badge variant="outline">{product.condition}</Badge>
              {product.aiVerified && <Badge variant="secondary">AI Verified</Badge>}
              {product.status === "ENDED" && <Badge variant="destructive">Ended</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-muted-foreground">Sold by {product.seller.name}</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Current bid</p>
                  <p className="text-3xl font-bold">{formatCurrency(product.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bids</p>
                  <p className="text-xl font-semibold text-center">{product.bids.length}</p>
                </div>
              </div>

              <AuctionTimer endTime={product.endTime} status={product.status} />

              {!isEnded && !isOwner && session?.user && (
                <BidForm productId={product.id} currentPrice={product.currentPrice} />
              )}

              {isEnded && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="font-medium">This auction has ended</p>
                  {product.winnerId && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Winning bid: {formatCurrency(product.currentPrice)}
                    </p>
                  )}
                </div>
              )}

              {isOwner && !isEnded && <EndAuctionButton productId={product.id} hasBids={hasBids} />}

              {isOwner && isEnded && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="font-medium">You ended this auction</p>
                  {product.winnerId ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      Winner: {product.bids[0]?.user.name || "Unknown"}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">No bids were placed</p>
                  )}
                </div>
              )}

              {!session?.user && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <p className="font-medium">Login to place a bid</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to be logged in to participate in this auction
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Details
              </TabsTrigger>
              <TabsTrigger value="bids" className="flex-1">
                Bid History
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              <div className="prose dark:prose-invert max-w-none">
                <p>{product.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Start Time</p>
                    <p>{new Date(product.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">End Time</p>
                    <p>{new Date(product.endTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Starting Price</p>
                    <p>{formatCurrency(product.startingPrice)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Current Price</p>
                    <p>{formatCurrency(product.currentPrice)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bids" className="mt-4">
              {product.bids.length > 0 ? (
                <div className="space-y-2">
                  {product.bids.map((bid) => (
                    <div key={bid.id} className="flex justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{bid.user.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(bid.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(bid.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No bids yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
