import { NextRequest, NextResponse } from 'next/server'

interface CoachRequestBody {
  message: string
  context?: {
    triggers?: string[]
    goal?: string
    replacementHabits?: string[]
    currentStreak?: number
    level?: number
  }
}

const SYSTEM_PROMPT = `You are UNBOUND Coach, a calm, grounded, non-judgmental accountability partner.
Your role is to help the user interrupt problematic urge loops, understand their emotional triggers, and pivot to constructive replacement habits.

CRITICAL CLINICAL & SAFETY PRINCIPLES:
1. NEVER provide a medical or clinical diagnosis. Never diagnose compulsive sexual behavior disorder, addiction, or mental health disorders.
2. NEVER shame, lecture, moralize, or guilt-trip the user. Use compassionate curiosity.
3. NEVER claim or pretend to be a licensed therapist, doctor, or psychiatrist.
4. If the user mentions self-harm, severe distress, suicidal ideation, or asks for medical help, immediately provide standard crisis hotline resources (e.g. 988 in the US/Canada, 111/999 in the UK, emergency services) and encourage professional care.
5. Keep responses concise, actionable, and grounded (typically 2-4 short sentences).
6. Shift focus from avoidance ("don't do X") to active substitution ("what positive action can we take in the next 5 minutes?").
7. Offer quick action options when helpful: 3-minute breath reset, cold water splash, 5-minute walk, focus quest.`

export async function POST(req: NextRequest) {
  try {
    const body: CoachRequestBody = await req.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY

    // Fallback response generator if API key is not configured or fails
    const generateFallbackResponse = (userMsg: string) => {
      const lower = userMsg.toLowerCase()
      if (lower.includes('urge') || lower.includes('craving') || lower.includes('tempt') || lower.includes('relapse')) {
        return "I hear you. Urges spike and naturally peak within minutes before fading. Let's interrupt this right now—step away from the screen, take 3 deep belly breaths, or splash cold water on your face. Would you like to enter Urge Mode for a guided reset?"
      }
      if (lower.includes('bored') || lower.includes('lonely') || lower.includes('alone')) {
        return "Boredom and isolation are two of the most common impulse triggers. Your mind is simply looking for dopamine. Let's pivot to one of your replacement quests—how about 10 minutes of chess, a quick walk, or reading 5 pages?"
      }
      if (lower.includes('relapsed') || lower.includes('failed') || lower.includes('messed up') || lower.includes('guilt') || lower.includes('ashamed')) {
        return "Take a deep breath. A setback is data, not a moral failure. One moment does not erase the progress or awareness you've built. Let's identify what triggered this moment without judgment so we can safeguard that window tomorrow."
      }
      return "I'm with you. Remember: your habits don't define you—your next choice does. What is one small, positive action you can take right now to reclaim your focus?"
    }

    // If an OpenAI API key is present, execute server-side API call
    if (process.env.OPENAI_API_KEY) {
      try {
        const contextSummary = context
          ? `User context: Triggers: ${context.triggers?.join(', ') || 'unknown'}, Goal: "${context.goal || 'unspecified'}", Streak: ${context.currentStreak || 0} days, Level: ${context.level || 1}.`
          : ''

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `${SYSTEM_PROMPT}\n${contextSummary}` },
              { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const reply = data.choices?.[0]?.message?.content
          if (reply) {
            return NextResponse.json({ reply })
          }
        }
      } catch (e) {
        console.error('OpenAI API call failed, using graceful fallback:', e)
      }
    }

    // Graceful offline/fallback response
    const reply = generateFallbackResponse(message)
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Coach route error:', error)
    return NextResponse.json(
      { reply: "Coach is temporarily resetting. Let's interrupt this moment—take 3 deep breaths or enter Urge Mode now." },
      { status: 200 }
    )
  }
}
