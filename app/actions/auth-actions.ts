"use server"

import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/utils"

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return {
      error: "All fields are required",
    }
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (existingUser) {
      return {
        error: "User with this email already exists",
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
    })

    return {
      success: "User registered successfully",
    }
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "An error occurred during registration",
    }
  }
}
