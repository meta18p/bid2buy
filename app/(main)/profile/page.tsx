
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getUserProducts, getUserBids } from "@/app/actions/product-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ProductCard from "@/components/product-card"
import BidsList from "@/components/bids-list"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const userProducts = await getUserProducts()
  const userBids = await getUserBids()

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt={session.user.name || ""} />
                  <AvatarFallback className="text-2xl">{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{session.user.name}</CardTitle>
                  <CardDescription>{session.user.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Listings</span>
                  <span>{userProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bids</span>
                  <span>{userBids.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="listings" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="bids">My Bids</TabsTrigger>
            </TabsList>
            <TabsContent value="listings">
              {userProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {userProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">You haven&apos;t listed any products yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="bids">
              <BidsList bids={userBids} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
