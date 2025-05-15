"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { placeBid } from "@/app/actions/product-actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"

interface BidFormProps {
  productId: string
  currentPrice: number
}

export default function BidForm({ productId, currentPrice }: BidFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [bidAmount, setBidAmount] = useState(currentPrice + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("amount", bidAmount.toString())

    const result = await placeBid(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
    } else if (result.success) {
      toast({
        title: "Success",
        description: result.success,
      })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bidAmount">Your bid</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">$</span>
          </div>
          <Input
            id="bidAmount"
            type="number"
            min={currentPrice + 1}
            step="0.01"
            className="pl-7"
            value={bidAmount}
            onChange={(e) => setBidAmount(Number.parseFloat(e.target.value))}
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">Minimum bid: {formatCurrency(currentPrice + 1)}</p>
        <p className="text-xs text-muted-foreground">
          You need at least {formatCurrency((currentPrice + 1) * 0.5)} in your wallet to place this bid.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Placing bid..." : "Place Bid"}
      </Button>
    </form>
  )
}
