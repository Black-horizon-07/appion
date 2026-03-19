import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODELS = {
  fast: "qwen/qwen-2.5-72b-instruct",
  thinking: "qwen/qwq-32b",
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 });
    }

    const { message, conversationId, mode = "fast" } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const userId = session.user.id as string;
    const model = MODELS[mode as keyof typeof MODELS] || MODELS.fast;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.chatConversation.findUnique({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 50 } },
      });
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
    } else {
      // Create a new conversation with a title derived from the first message
      const title = message.length > 40 ? message.substring(0, 40) + "..." : message;
      conversation = await db.chatConversation.create({
        data: { userId, title, mode },
      });
      // Actually include empty messages array  
      conversation = { ...conversation, messages: [] };
    }

    // Save user message
    await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Build message history for context
    const history = conversation.messages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: 'user', content: message });

    // Call OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are Appion AI, a helpful and friendly productivity assistant. You help users manage their time, stay focused, and achieve their goals. Be concise, supportive, and actionable in your responses. Use markdown formatting when helpful." },
          ...history,
        ],
        temperature: mode === "thinking" ? 0.7 : 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Save AI response
    await db.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiContent,
      },
    });

    // Update conversation timestamp
    await db.chatConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: aiContent,
      mode,
    });
  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: 'Failed to get AI response', details: error.message }, { status: 500 });
  }
}
