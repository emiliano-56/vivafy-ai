export async function POST(request: Request) {
  try {
    const { audioUrl } = await request.json()

    if (!audioUrl) {
      return Response.json(
        { error: "audioUrl is required" },
        { status: 400 }
      )
    }

    // Fetch from the external API (server-side, no CORS issues)
    const response = await fetch(audioUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()

    // Return as base64
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return Response.json({ base64, mimeType: blob.type })
  } catch (error) {
    console.error("Proxy error:", error)
    return Response.json(
      { error: "Failed to proxy audio" },
      { status: 500 }
    )
  }
}
