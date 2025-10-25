import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define priority detection schema
const PrioritySchema = z.object({
  priority: z.enum(["high", "normal", "low"]),
  reason: z.string(),
  urgencyScore: z.number().min(0).max(10),
});

export async function POST(req: Request) {
  try {
    const { messageText } = await req.json();

    // Validate input
    if (!messageText) {
      return NextResponse.json(
        { error: "messageText is required" },
        { status: 400 }
      );
    }

    // Create prompt for priority detection
    const prompt = `Analyze this message and determine if it's urgent or high priority.

Consider these factors:
- Explicit urgency indicators: "ASAP", "urgent", "emergency", "critical", "immediately"
- Deadlines: "by EOD", "today", "right now", specific times
- Problems/blockers: "down", "broken", "not working", "blocked", "issue"
- Escalations: "escalate", "management", "need help now"
- Requests for immediate action: "please respond", "waiting on you", "need this now"

Message: "${messageText}"

Respond with:
- priority: "high" (urgent/time-sensitive), "normal" (regular), or "low" (informational/casual)
- reason: Brief explanation for the priority level (1-2 sentences)
- urgencyScore: 0-10 scale (0=no urgency, 10=critical emergency)`;

    // Generate priority analysis
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: PrioritySchema,
      prompt,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Priority detection error:", error);
    return NextResponse.json(
      { error: "Failed to detect priority" },
      { status: 500 }
    );
  }
}

