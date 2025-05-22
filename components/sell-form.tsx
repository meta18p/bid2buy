"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Loader2, Upload, Check, AlertTriangle, Video, ImageIcon, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { verifyProductVideo } from "@/app/actions/video-verification-actions"

export default function SellForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [useAIVerification, setUseAIVerification] = useState(true)
  const [durationType, setDurationType] = useState("days")
  const [durationValue, setDurationValue] = useState(7)
  const [mediaType, setMediaType] = useState<"image" | "video">("image")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "uploading" | "processing" | "success" | "error"
  >("idle")
  const [verificationMessage, setVerificationMessage] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      setSelectedImages(files)

      // Create preview URLs
      const urls = files.map((file) => URL.createObjectURL(file))
      setPreviewUrls(urls)
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setSelectedVideo(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setVideoPreviewUrl(url)
    }
  }

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
    }
    setSelectedVideo(null)
    setVideoPreviewUrl(null)
    setVerificationStatus("idle")
    setVerificationMessage("")
    setIsVerified(false)
  }

  const removeImage = (index: number) => {
    const newImages = [...selectedImages]
    const newUrls = [...previewUrls]

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index])

    newImages.splice(index, 1)
    newUrls.splice(index, 1)

    setSelectedImages(newImages)
    setPreviewUrls(newUrls)
  }

  const simulateProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 200)

    return () => clearInterval(interval)
  }

  const verifyVideo = async () => {
    if (!selectedVideo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a video to verify",
      })
      return
    }

    setVerificationStatus("uploading")
    setIsVerifying(true)
    const stopProgress = simulateProgress()

    try {
      // Create a FormData object to send the video
      const formData = new FormData()
      formData.append("video", selectedVideo)

      setVerificationStatus("processing")

      // Call the verification API
      const result = await verifyProductVideo(formData)

      setUploadProgress(100)

      if (result.isVerified) {
        setVerificationStatus("success")
        setVerificationMessage(result.message || "Video verification successful!")
        setIsVerified(true)
        toast({
          title: "Verification successful",
          description: "Your product has been verified by our system",
        })
      } else {
        setVerificationStatus("error")
        setVerificationMessage(result.message || "Video verification failed. Please try again.")
        setIsVerified(false)
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: result.message || "Your product did not pass verification",
        })
      }
    } catch (error) {
      console.error("Verification error:", error)
      setVerificationStatus("error")
      setVerificationMessage("An error occurred during verification. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during verification",
      })
    } finally {
      stopProgress()
      setIsVerifying(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mediaType === "video") {
      await verifyVideo()
      return
    }

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
        description: "Please verify your product before submitting",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    formData.append("aiVerified", isVerified.toString())
    formData.append("durationType", durationType)
    formData.append("durationValue", durationValue.toString())
    formData.append("mediaType", mediaType)

    // Add images to form data
    if (mediaType === "image") {
      selectedImages.forEach((image) => {
        formData.append("images", image)
      })
    } else if (mediaType === "video" && selectedVideo) {
      formData.append("video", selectedVideo)
    }

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

  const getVerificationStatusText = () => {
    switch (verificationStatus) {
      case "uploading":
        return "Uploading video..."
      case "processing":
        return "Processing verification..."
      case "success":
        return verificationMessage || "Verification successful!"
      case "error":
        return verificationMessage || "Verification failed"
      default:
        return "Upload a video to verify your product"
    }
  }

  const getVerificationStatusColor = () => {
    switch (verificationStatus) {
      case "uploading":
      case "processing":
        return "text-amber-600 dark:text-amber-400"
      case "success":
        return "text-green-600 dark:text-green-400"
      case "error":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-muted-foreground"
    }
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
            <Label>Product Media</Label>
            <Tabs value={mediaType} onValueChange={(value) => setMediaType(value as "image" | "video")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="image">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Images
                </TabsTrigger>
                <TabsTrigger value="video">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="image" className="mt-4">
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
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="video" className="mt-4">
                {!videoPreviewUrl ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <Input id="video" type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                    <label htmlFor="video" className="cursor-pointer">
                      <Video className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-muted-foreground">Click to upload a verification video</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV, WEBM up to 100MB</p>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <video ref={videoRef} src={videoPreviewUrl} className="w-full h-auto rounded-lg" controls />
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {verificationStatus !== "idle" && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Verification Status</span>
                      <span className={`text-sm ${getVerificationStatusColor()}`}>
                        {verificationStatus === "success"
                          ? "Verified"
                          : verificationStatus === "error"
                            ? "Failed"
                            : "Processing"}
                      </span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className={`text-sm mt-2 ${getVerificationStatusColor()}`}>{getVerificationStatusText()}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-medium">Product Verification</h3>
                  <p className="text-sm text-muted-foreground">Verify your product to ensure it meets our guidelines</p>
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
                    disabled={isVerifying || (mediaType === "image" ? !selectedImages.length : !selectedVideo)}
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
                      "Verify Product"
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
