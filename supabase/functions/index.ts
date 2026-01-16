// supabase/functions/summarize-note/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log(`Function "summarize-note" up and running!`)

// In a real-world scenario, you would initialize your AI client here.
// For example, using the OpenAI library:
// import { OpenAI } from "https://deno.land/x/openai/mod.ts";
// const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! })

serve(async (req) => {
  // This is needed to handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // The function is called with a JSON body containing the note's content.
    const { content } = await req.json()

    if (!content) {
      throw new Error('No content provided.')
    }

    // --- AI Summarization Logic would go here ---
    // For now, we'll just return a dummy summary.
    //
    // Example with OpenAI:
    // const completion = await openai.chat.completions.create({
    //   messages: [
    //     { role: 'system', content: 'You are a helpful assistant that summarizes notes concisely.' },
    //     { role: 'user', content: `Summarize this note: ${content}` },
    //   ],
    //   model: 'gpt-3.5-turbo',
    // })
    // const summary = completion.choices[0].message.content

    const summary = `This is a dummy AI summary for the note that starts with: "${content.substring(0, 50)}..."`

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})