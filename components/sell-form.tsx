"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { createProduct } from "@/app/actions/product-actions"
import { verifyProductWithAI } from "@/app/actions/ai-verification-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, Check, AlertTriangle } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SellForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [useAIVerification, setUseAIVerification] = useState(true)
  const [durationType, setDurationType] = useState("days")
  const [durationValue, setDurationValue] = useState(7)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedImages(files)

      // Create preview URLs
      const urls = files.map((file) => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedImages.length) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload at least one image to verify",
      })
      return
    }

    const form = e.target as HTMLFormElement
    const description = form.description.value

    if (!description) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a description to verify",
      })
      return
    }

    setIsVerifying(true)

    try {
      // For demo purposes, we'll use a placeholder image URL
      // In a real app, you would upload the image first and get a URL
      const imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30"

      const result = await verifyProductWithAI(imageUrl, description)
      setVerificationResult(result)

      if (result.isApproved) {
        setIsVerified(true)
        toast({
          title: "Verification successful",
          description: "Your product has been verified by AI",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: "Your product did not pass AI verification",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during verification",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useAIVerification && !isVerified) {
      toast({
        variant: "destructive",
        title: "Verification required",
        description: "Please verify your product with AI before submitting",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    formData.append("aiVerified", isVerified.toString())
    formData.append("durationType", durationType)
    formData.append("durationValue", durationValue.toString())

    // Add images to form data
    selectedImages.forEach((image) => {
      formData.append("images", image)
    })

    const result = await createProduct(formData)

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      })
      setIsLoading(false)
    } else if (result.success) {
      toast({
        title: "Success",
        description: result.success,
      })

      router.push(`/auction/${result.productId}`)
    }
  }

  const getDurationHelperText = () => {
    const now = new Date()
    const endDate = new Date()

    switch (durationType) {
      case "hours":
        endDate.setHours(now.getHours() + durationValue)
        break
      case "days":
        endDate.setDate(now.getDate() + durationValue)
        break
      case "weeks":
        endDate.setDate(now.getDate() + durationValue * 7)
        break
    }

    return `Auction will end on ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Product title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your product in detail"
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price ($)</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <Input
                id="startingPrice"
                name="startingPrice"
                type="number"
                min="1"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Auction Duration</Label>
            <RadioGroup
              defaultValue="days"
              className="flex space-x-4 mb-2"
              value={durationType}
              onValueChange={setDurationType}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hours" id="hours" />
                <Label htmlFor="hours">Hours</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="days" id="days" />
                <Label htmlFor="days">Days</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weeks" id="weeks" />
                <Label htmlFor="weeks">Weeks</Label>
              </div>
            </RadioGroup>

            <div className="flex items-center gap-4">
              <Input
                type="number"
                min={durationType === "hours" ? 1 : 1}
                max={durationType === "hours" ? 72 : durationType === "days" ? 30 : 8}
                value={durationValue}
                onChange={(e) => setDurationValue(Number.parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{durationType}</span>
            </div>

            <p className="text-xs text-muted-foreground">{getDurationHelperText()}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="collectibles">Collectibles</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="art">Art</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select name="condition" required defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">AI Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify your product with AI to ensure it meets our guidelines
                  </p>
                </div>
                <Switch checked={useAIVerification} onCheckedChange={setUseAIVerification} />
              </div>

              {useAIVerification && (
                <>
                  {isVerified ? (
                    <div className="flex items-center text-green-600 dark:text-green-500">
                      <Check className="h-5 w-5 mr-2" />
                      <span>Verified</span>
                    </div>
                  ) : verificationResult && !verificationResult.isApproved ? (
                    <div className="flex items-center text-red-600 dark:text-red-500">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>Verification failed</span>
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleVerify}
                    disabled={isVerifying || !selectedImages.length}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : isVerified ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Verified
                      </>
                    ) : (
                      "Verify with AI"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || (useAIVerification && !isVerified)}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Auction"
          )}
        </Button>
      </div>
    </form>
  )
}
