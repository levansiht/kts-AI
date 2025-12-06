import { NextRequest, NextResponse } from "next/server";

// This will use GEMINI_API_KEY (server-side only, not NEXT_PUBLIC_)
const API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { endpoint, method = "POST", data } = body;

    // Forward request to Google AI API
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
