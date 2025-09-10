import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    const response = await fetch(`${API_BASE_URL}/settings`, {
      cache: "no-cache", // Don't cache this request
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data?.seo) {
      return NextResponse.json({ seo: data.data.seo });
    } else {
      return NextResponse.json(
        {
          error: "Invalid response format",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
