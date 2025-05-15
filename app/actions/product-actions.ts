"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Modify the createProduct function to support custom durations
export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: "You must be logged in to create a product",
    }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startingPriceStr = formData.get("startingPrice") as string
  const startingPrice = Number.parseFloat(startingPriceStr)
  const durationTypeStr = formData.get("durationType") as string
  const durationValueStr = formData.get("durationValue") as string
  const durationValue = Number.parseInt(durationValueStr)
  const category = formData.get("category") as string
  const condition = formData.get("condition") as string
  const images = formData.getAll("images") as File[]
  const aiVerified = formData.get("aiVerified") as string

  if (
    !title ||
    !description ||
    isNaN(startingPrice) ||
    !durationTypeStr ||
    isNaN(durationValue) ||
    !category ||
    !condition
  ) {
    return {
      error: "All fields are required",
    }
  }

  if (startingPrice <= 0) {
    return {
      error: "Starting price must be greater than 0",
    }
  }

  if (durationValue <= 0) {
    return {
      error: "Duration must be greater than 0",
    }
  }

  try {
    // Calculate end time based on duration type and value
    const endTime = new Date()

    switch (durationTypeStr) {
      case "hours":
        endTime.setHours(endTime.getHours() + durationValue)
        break
      case "days":
        endTime.setDate(endTime.getDate() + durationValue)
        break
      case "weeks":
        endTime.setDate(endTime.getDate() + durationValue * 7)
        break
      default:
        endTime.setDate(endTime.getDate() + durationValue) // Default to days
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        title,
        description,
        startingPrice,
        currentPrice: startingPrice,
        endTime,
        category,
        condition,
        sellerId: session.user.id,
        images: [], // We'll update this after uploading images
        aiVerified: aiVerified === "true",
      },
    })

    // TODO: Handle image uploads and update product with image URLs

    revalidatePath("/")
    return {
      success: "Product created successfully",
      productId: product.id,
    }
  } catch (error) {
    console.error("Create product error:", error)
    return {
      error: "An error occurred while creating the product",
    }
  }
}

export async function getProducts(category?: string, search?: string) {
  try {
    const where: any = {
      status: "ACTIVE",
      endTime: {
        gt: new Date(),
      },
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return products
  } catch (error) {
    console.error("Get products error:", error)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
        bids: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            amount: "desc",
          },
        },
      },
    })

    return product
  } catch (error) {
    console.error("Get product error:", error)
    return null
  }
}

export async function placeBid(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: "You must be logged in to place a bid",
    }
  }

  const productId = formData.get("productId") as string
  const amountStr = formData.get("amount") as string
  const amount = Number.parseFloat(amountStr)

  if (!productId || isNaN(amount)) {
    return {
      error: "Invalid bid data",
    }
  }

  try {
    // Get product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        seller: true,
      },
    })

    if (!product) {
      return {
        error: "Product not found",
      }
    }

    if (product.status !== "ACTIVE") {
      return {
        error: "This auction has ended",
      }
    }

    if (product.endTime < new Date()) {
      return {
        error: "This auction has ended",
      }
    }

    if (product.sellerId === session.user.id) {
      return {
        error: "You cannot bid on your own product",
      }
    }

    if (amount <= product.currentPrice) {
      return {
        error: "Bid amount must be higher than current price",
      }
    }

    // Check if user has enough funds (50% of bid amount)
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!wallet) {
      return {
        error: "You don't have a wallet",
      }
    }

    const requiredFunds = amount * 0.5
    if (wallet.balance < requiredFunds) {
      return {
        error: `You need at least $${requiredFunds.toFixed(2)} in your wallet to place this bid`,
      }
    }

    // Deduct funds from wallet (50% of bid amount)
    await prisma.wallet.update({
      where: {
        id: wallet.id,
      },
      data: {
        balance: {
          decrement: requiredFunds,
        },
        transactions: {
          create: {
            amount: -requiredFunds,
            type: "BID",
            description: `Placed bid on ${product.title}`,
            userId: session.user.id,
            productId,
          },
        },
      },
    })

    // Create bid
    await prisma.bid.create({
      data: {
        amount,
        userId: session.user.id,
        productId,
      },
    })

    // Update product current price
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        currentPrice: amount,
      },
    })

    revalidatePath(`/auction/${productId}`)
    return {
      success: "Bid placed successfully",
    }
  } catch (error) {
    console.error("Place bid error:", error)
    return {
      error: "An error occurred while placing the bid",
    }
  }
}

export async function getUserProducts() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        sellerId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            bids: true,
          },
        },
      },
    })

    return products
  } catch (error) {
    console.error("Get user products error:", error)
    return []
  }
}

export async function getUserBids() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  try {
    const bids = await prisma.bid.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return bids
  } catch (error) {
    console.error("Get user bids error:", error)
    return []
  }
}

// Add a new action to end an auction prematurely
export async function endAuctionEarly(productId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: "You must be logged in to end an auction",
    }
  }

  try {
    // Get the product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        bids: {
          orderBy: {
            amount: "desc",
          },
          take: 1,
        },
      },
    })

    if (!product) {
      return {
        error: "Product not found",
      }
    }

    if (product.sellerId !== session.user.id) {
      return {
        error: "You can only end your own auctions",
      }
    }

    if (product.status !== "ACTIVE") {
      return {
        error: "This auction has already ended",
      }
    }

    // Determine the winner (highest bidder)
    const winnerId = product.bids.length > 0 ? product.bids[0].userId : null

    // Update the product status
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        status: "ENDED",
        winnerId,
      },
    })

    // Process refunds for non-winning bidders if there are bids
    if (product.bids.length > 0) {
      // Get all bids except the winning bid
      const nonWinningBids = await prisma.bid.findMany({
        where: {
          productId,
          userId: {
            not: winnerId,
          },
        },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      })

      // Process refunds
      for (const bid of nonWinningBids) {
        if (bid.user.wallet) {
          const refundAmount = bid.amount * 0.5 // 50% of bid amount was held

          await prisma.wallet.update({
            where: {
              id: bid.user.wallet.id,
            },
            data: {
              balance: {
                increment: refundAmount,
              },
              transactions: {
                create: {
                  amount: refundAmount,
                  type: "REFUND",
                  description: `Refund for bid on ${product.title}`,
                  userId: bid.userId,
                  productId,
                },
              },
            },
          })
        }
      }
    }

    revalidatePath(`/auction/${productId}`)
    return {
      success: "Auction ended successfully",
    }
  } catch (error) {
    console.error("End auction error:", error)
    return {
      error: "An error occurred while ending the auction",
    }
  }
}
