"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addFunds } from "@/app/actions/wallet-actions"
import { useToast } from "@/hooks/use-toast"

export default function AddFundsForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)

    const result = await addFunds(formData)

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

      // Reset the form
      const form = document.getElementById("add-funds-form") as HTMLFormElement
      form.reset()
    }

    setIsLoading(false)
  }

  return (
    <form id="add-funds-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500">$</span>
          </div>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            min="1"
            step="0.01"
            className="pl-7"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding funds..." : "Add Funds"}
      </Button>
    </form>
  )
}
