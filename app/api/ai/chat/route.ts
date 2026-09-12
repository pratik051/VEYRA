import { NextRequest, NextResponse } from "next/server";
import { generateGeminiChatReply, ChatMessage } from "@/lib/ai/gemini-client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (!message) {
      return NextResponse.json(
        { success: false, error: "Message is required." },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Message is too long (max 2,000 characters)." },
        { status: 400 }
      );
    }

    const { reply, modelUsed } = await generateGeminiChatReply(message, history);

    return NextResponse.json({
      success: true,
      reply,
      modelUsed,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to generate AI response."
      },
      { status: 500 }
    );
  }
}
