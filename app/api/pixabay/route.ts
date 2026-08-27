// app/api/pixabay/route.ts
import { NextRequest, NextResponse } from "next/server";

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || "55675917-22f527e6847748c6b42f75989";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || "";
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "20";
    const imageType = searchParams.get("image_type") || "photo";
    const orientation = searchParams.get("orientation") || "all";

    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}&image_type=${imageType}&orientation=${orientation}&safesearch=true`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60 * 60 * 24, // ✅ cache 24 hours (Pixabay requirement)
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch images" },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}