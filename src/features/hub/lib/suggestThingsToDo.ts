import type { ThingsToDoSuggestion } from '../../../types/hub'

export const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️',
  outdoors: '🌳',
  shopping: '🛍️',
  culture: '🏛️',
  entertainment: '🎭',
  general: '📍',
}

export async function suggestThingsToDo(
  city: string,
  state: string,
  weddingDate: string,
): Promise<ThingsToDoSuggestion[]> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('VITE_ANTHROPIC_API_KEY not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: `Generate 6 local activity recommendations for out-of-town wedding guests visiting ${city}, ${state} around ${weddingDate}.

Return ONLY a JSON array with no preamble or markdown. Each item must have these exact fields:
- name: string (place name)
- category: one of: food, outdoors, shopping, culture, entertainment, general
- description: string (2 sentences max, friendly tone, helpful for a visitor)
- distance_hint: string (e.g. "Near downtown" or "About 10 minutes from most hotels")

Include a mix of categories. Favour well-known, easy-to-find places suitable for wedding guests who may not know the city. Do not include venues that are typically closed on weekends.

Return only the JSON array.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`)
  }

  const data = await response.json()
  const text: string = data.content?.find((c: { type: string }) => c.type === 'text')?.text || '[]'

  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(clean) as ThingsToDoSuggestion[]
    // Validate each item has required fields
    return parsed.filter((item) => item.name && item.category && item.description)
  } catch {
    return []
  }
}
