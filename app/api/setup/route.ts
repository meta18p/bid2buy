import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET() {
  try {
    // Check if we already have users
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      return NextResponse.json({ message: "Database already has data" })
    }

    // Create test users
    const password = await hash("password123", 10)

    const user1 = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        password,
        wallet: {
          create: {
            balance: 1000,
          },
        },
      },
    })

    const user2 = await prisma.user.create({
      data: {
        name: "Jane Smith",
        email: "jane@example.com",
        password,
        wallet: {
          create: {
            balance: 2000,
          },
        },
      },
    })

    // Create sample products
    const product1 = await prisma.product.create({
      data: {
        title: "Vintage Camera",
        description:
          "A beautiful vintage camera in excellent condition. Perfect for collectors or photography enthusiasts.",
        startingPrice: 50,
        currentPrice: 50,
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        category: "collectibles",
        condition: "good",
        sellerId: user1.id,
        images: ["/placeholder.svg?height=400&width=400&text=Vintage+Camera"],
        aiVerified: true,
      },
    })

    const product2 = await prisma.product.create({
      data: {
        title: "Gaming Laptop",
        description: "High-performance gaming laptop with the latest graphics card and processor. Barely used.",
        startingPrice: 800,
        currentPrice: 800,
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        category: "electronics",
        condition: "like-new",
        sellerId: user2.id,
        images: ["/placeholder.svg?height=400&width=400&text=Gaming+Laptop"],
        aiVerified: true,
      },
    })

    const product3 = await prisma.product.create({
      data: {
        title: "Antique Watch",
        description: "Rare antique watch from the 1920s. Still works perfectly and comes with original box.",
        startingPrice: 300,
        currentPrice: 300,
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        category: "collectibles",
        condition: "fair",
        sellerId: user1.id,
        images: ["/placeholder.svg?height=400&width=400&text=Antique+Watch"],
        aiVerified: true,
      },
    })

    return NextResponse.json({
      message: "Database setup completed",
      users: [user1, user2],
      products: [product1, product2, product3],
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "An error occurred during setup" }, { status: 500 })
  }
}
