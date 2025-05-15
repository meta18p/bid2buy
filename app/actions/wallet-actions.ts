"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addFunds(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return {
      error: "You must be logged in to add funds",
    }
  }

  const amountStr = formData.get("amount") as string
  const amount = Number.parseFloat(amountStr)

  if (isNaN(amount) || amount <= 0) {
    return {
      error: "Please enter a valid amount",
    }
  }

  try {
    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: amount,
          transactions: {
            create: {
              amount,
              type: "DEPOSIT",
              description: "Added funds to wallet",
              userId: session.user.id,
            },
          },
        },
      })
    } else {
      // Update existing wallet
      await prisma.wallet.update({
        where: {
          id: wallet.id,
        },
        data: {
          balance: {
            increment: amount,
          },
          transactions: {
            create: {
              amount,
              type: "DEPOSIT",
              description: "Added funds to wallet",
              userId: session.user.id,
            },
          },
        },
      })
    }

    revalidatePath("/wallet")
    return {
      success: `Successfully added $${amount.toFixed(2)} to your wallet`,
    }
  } catch (error) {
    console.error("Add funds error:", error)
    return {
      error: "An error occurred while adding funds",
    }
  }
}

export async function getWalletBalance() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  try {
    const wallet = await prisma.wallet.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    return wallet?.balance || 0
  } catch (error) {
    console.error("Get wallet balance error:", error)
    return null
  }
}

export async function getTransactions() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return []
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return transactions
  } catch (error) {
    console.error("Get transactions error:", error)
    return []
  }
}
