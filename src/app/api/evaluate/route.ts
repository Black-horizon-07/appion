import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plannedActivity, actualActivity } = await request.json();

    if (!plannedActivity || !actualActivity) {
      return NextResponse.json({ error: 'Missing planned or actual activity' }, { status: 400 });
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Missing OpenRouter API key' }, { status: 500 });
    }

    const prompt = `You are an insightful productivity assessor. 
The user planned to do this task: "${plannedActivity}".
The user is currently doing this activity: "${actualActivity}".

Evaluate how productive their current activity is, considering both their planned schedule AND the inherent value of what they are actually doing.
Give a productivity score percentage from 0 to 100 on a continuous sliding scale based on this guidance:
- 90-100: Exact match to the schedule, deep focus, or highly productive equivalent.
- 70-89: The user is doing something genuinely productive (like reading a book, learning, editing, exercising), even if it was NOT what they scheduled. Reward them for doing valuable work instead of time-wasting.
- 40-69: Neutral tasks, necessary breaks (like eating/bathroom), or administrative work.
- 10-39: Distracted, unrelated, but benign (e.g., listening to music, chatting).
- 0-9: Completely off-task, scrolling social media, playing video games, or sleeping when they should be working.

CRITICAL RULE: If the user is doing something inherently productive (like reading, studying, or building something else) instead of their planned task, DO NOT punish them heavily. Give them a good score (70-89) for being productive off-schedule.

You must choose any integer between 0 and 100 that perfectly represents their focus level.
Also provide a short 1-2 sentence actionable suggestion based on this alignment. If they are distracted, give a gentle nudge. If they are being productive off-schedule, encourage their positive habit but remind them of their plan.
Respond strictly in JSON format like this: {"score": 85, "suggestion": "Your suggestion here."}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen-2.5-72b-instruct", 
        response_format: { type: "json_object" },
        temperature: 0.0,
        messages: [
          { role: "system", content: "You are an AI productivity assessor. You strictly output valid JSON containing 'score' (number) and 'suggestion' (string)." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Parse JSON safely
    let score = 0;
    let suggestion = "Keep up the good work!";
    
    try {
      // Sometimes models wrap json in codeblocks
      if (content.startsWith('```json')) {
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(content);
      score = parsed.score || 0;
      suggestion = parsed.suggestion || suggestion;
    } catch (e) {
      // Fallback regex parsing if json fails
      const match = content.match(/"score"\s*:\s*(\d+)/);
      if (match) score = parseInt(match[1], 10);
    }
    
    // Clamp between 0-100
    score = Math.max(0, Math.min(100, score));

    // Save to ProductivityLog
    const log = await db.productivityLog.create({
      data: {
        userId: session.user.id as string,
        plannedActivity,
        actualActivity,
        score
      }
    });

    return NextResponse.json({ score, suggestion, logId: log.id });
  } catch (error: any) {
    console.error('AI Evaluation Error:', error);
    return NextResponse.json({ error: 'Failed to evaluate activity', details: error.message }, { status: 500 });
  }
}
