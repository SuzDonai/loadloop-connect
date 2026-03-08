import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MAPPLS_API_KEY = Deno.env.get('MAPPLS_API_KEY');
    if (!MAPPLS_API_KEY) {
      throw new Error('MAPPLS_API_KEY is not configured');
    }

    const { pickupLat, pickupLon, dropLat, dropLon } = await req.json();

    if (!pickupLat || !pickupLon || !dropLat || !dropLon) {
      return new Response(
        JSON.stringify({ error: 'Missing coordinates' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mappls Distance Matrix API: GET request
    // Format: lon,lat;lon,lat
    const url = `https://route.mappls.com/route/dm/distance_matrix/driving/${pickupLon},${pickupLat};${dropLon},${dropLat}?region=ind&access_token=${MAPPLS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Mappls API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    // Extract distance (meters) and duration (seconds) from response
    const result = {
      distance: data.results?.distances?.[0]?.[1] ?? null,
      duration: data.results?.durations?.[0]?.[1] ?? null,
      status: data.responseCode ?? data.status,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Mappls distance error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
