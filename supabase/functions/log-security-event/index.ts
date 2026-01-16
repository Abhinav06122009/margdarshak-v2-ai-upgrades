import { corsHeaders } from '../_shared/cors.ts';

console.log('Initializing log-security-event function v1.6 (debug-env)');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('FUNCTION_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('FUNCTION_SUPABASE_SERVICE_ROLE_KEY');

    return new Response(
      JSON.stringify({
        message: 'Debugging environment variables',
        supabaseUrl: supabaseUrl ? 'URL is set' : 'URL is NOT set',
        serviceRoleKey: serviceRoleKey ? 'Key is set' : 'Key is NOT set',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: 'An internal error occurred', details: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
