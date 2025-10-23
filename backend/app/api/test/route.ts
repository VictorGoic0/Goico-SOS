import { NextResponse } from "next/server";

/**
 * Test GET endpoint
 * Verifies that the backend is deployed and accessible
 */
export async function GET() {
  return NextResponse.json({
    message: "Hello from Vercel serverless function!",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
}

/**
 * Test POST endpoint
 * Echoes back the data sent to it
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    return NextResponse.json({
      message: "Received your data!",
      data: body,
      timestamp: new Date().toISOString(),
      status: "success",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to parse request body",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        status: "error",
      },
      { status: 400 }
    );
  }
}

