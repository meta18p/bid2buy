"use server"

export async function verifyProductWithAI(imageUrl: string, description: string) {
  try {
    // Call EdenAI API for image moderation
    const imageResponse = await fetch("https://api.edenai.run/v2/image/moderation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EDENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providers: "amazon",
        file_url: imageUrl,
      }),
    })

    const imageData = await imageResponse.json()

    // Call EdenAI API for text moderation
    const textResponse = await fetch("https://api.edenai.run/v2/text/moderation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EDENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providers: "amazon",
        text: description,
        language: "en",
      }),
    })

    const textData = await textResponse.json()

    // Check if the image and text are appropriate
    const imageResult = imageData.amazon?.nsfw_likelihood || 0
    const textResult = textData.amazon?.nsfw_likelihood || 0

    const isApproved = imageResult < 0.5 && textResult < 0.5

    return {
      isApproved,
      imageScore: imageResult,
      textScore: textResult,
      details: {
        image: imageData,
        text: textData,
      },
    }
  } catch (error) {
    console.error("AI verification error:", error)
    return {
      isApproved: false,
      error: "An error occurred during AI verification",
    }
  }
}
