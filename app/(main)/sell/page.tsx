import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import SellForm from "@/components/sell-form"

export default async function SellPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
      <p className="text-muted-foreground mb-8">List your item for auction and let buyers bid on it.</p>

      <SellForm />
    </div>
  )
}
