import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { processCustomerChat, ChatMessage, PageContext } from "@/lib/support/chat-engine";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 500;

export async function POST(request: Request) {
  let body: any;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please send a valid message." }, { status: 400 });
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history : [];
  const pageContext: PageContext | undefined = body?.pageContext && typeof body.pageContext === "object" ? body.pageContext : undefined;

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  try {
    // Authenticate user session server-side (never trust client-sent userId)
    const user = await getCurrentUser();

    // Process chat query against live MongoDB catalog & orders
    const result = await processCustomerChat(message, user, history, pageContext);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      products: result.products || [],
      orders: result.orders || [],
      suggestions: result.suggestions || []
    });
  } catch (err: unknown) {
    console.error("Chat backend execution error:", err);
    return NextResponse.json(
      {
        success: false,
        answer: "I'm having trouble retrieving that information right now. Please try again in a few moments.",
        suggestions: ["Show trending products", "Today's best deals", "How does India sourcing work?"]
      },
      { status: 200 }
    );
  }
}
