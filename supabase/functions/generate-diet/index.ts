import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { calories, protein_g, carbs_g, fat_g, goal } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const goalMap: Record<string, string> = {
      lose: "perder peso (déficit calórico)",
      maintain: "mantener peso",
      gain: "ganar masa muscular (superávit calórico)",
    };

    const prompt = `Genera un plan de dieta diaria personalizado en español para una persona con los siguientes requerimientos:
- Calorías objetivo: ${calories} kcal/día
- Proteína: ${protein_g}g
- Carbohidratos: ${carbs_g}g
- Grasas: ${fat_g}g
- Objetivo: ${goalMap[goal] || goal}

Genera exactamente 5 comidas (Desayuno, Media Mañana, Almuerzo, Merienda, Cena). Para cada comida incluye:
- Nombre de la comida
- Lista de alimentos con cantidades en gramos
- Calorías aproximadas de esa comida

Al final agrega 2-3 consejos breves según el objetivo.

Responde SOLO en formato texto estructurado con emojis, NO uses markdown con ### ni **. Usa emojis como separadores visuales.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Eres un nutricionista profesional. Generas planes de dieta detallados, prácticos y saludables basados en los macronutrientes proporcionados. Responde siempre en español." },
          { role: "user", content: prompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
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
    console.error("generate-diet error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
