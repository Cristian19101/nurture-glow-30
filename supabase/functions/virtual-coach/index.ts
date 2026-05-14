import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages = [], profile = {} } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY no configurada");

    const profileLine = [
      profile.weight && `peso ${profile.weight} kg`,
      profile.height && `altura ${profile.height} cm`,
      profile.age && `edad ${profile.age} años`,
      profile.calories && `objetivo calórico ${profile.calories} kcal/día`,
      profile.goal && `objetivo: ${profile.goal}`,
    ].filter(Boolean).join(', ');

    const systemPrompt = `Eres un coach virtual experto en nutrición, entrenamiento y hábitos saludables. Respondes en español de forma cercana, motivacional, breve y práctica (máx ~180 palabras). Siempre que sea posible, personalizas según los datos del usuario.
${profileLine ? `Datos del usuario: ${profileLine}.` : 'El usuario aún no ha compartido datos personales; sugiere que los complete en la sección "Mi perfil".'}

Reglas:
- No reemplazas a un médico; ante dolor, lesión o síntoma sugiere consultar a un profesional.
- Estructura las respuestas con frases cortas, viñetas con "•" cuando ayuden, y emojis discretos.
- Si te preguntan sobre proteínas, calorías o macros, da rangos numéricos concretos basados en los datos disponibles.
- Si faltan datos clave, haz UNA pregunta breve para personalizar mejor.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (e) {
    console.error("virtual-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});