import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Msg = { role: 'user' | 'assistant'; content: string };

const COACH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virtual-coach`;

const SUGGESTED = [
  '¿Estoy consumiendo suficiente proteína?',
  '¿Qué puedo hacer para bajar grasa abdominal?',
  '¿Cómo mejorar mi déficit calórico?',
  '¿Qué ejercicios puedo hacer si tengo dolor de rodilla?',
];

const HEALTH_TIPS = [
  { icon: '💧', title: 'Hidratación', text: 'Apunta a 30-35 ml de agua por kg de peso al día.' },
  { icon: '😴', title: 'Descanso', text: 'Dormir 7-9 h mejora la recuperación y la composición corporal.' },
  { icon: '🥩', title: 'Proteína', text: 'Distribuye 1.6-2.2 g/kg en 3-5 tomas para preservar músculo.' },
  { icon: '🏃', title: 'Movimiento', text: 'Sumar 7-10 mil pasos diarios incrementa tu TDEE notablemente.' },
];

export default function VirtualCoach() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: '¡Hola! Soy tu coach virtual de nutrición y entrenamiento. Puedo ayudarte con calorías, proteínas, rutinas, hábitos saludables y objetivos físicos. ¿Por dónde empezamos?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Optional user context (persisted in localStorage)
  const [profile, setProfile] = useState({
    weight: '', height: '', age: '', goal: '', calories: '',
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('coach-profile');
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('coach-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch(COACH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
          profile,
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${err.error || 'No se pudo obtener respuesta del coach.'}` }]);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let acc = '';
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              if (!started) {
                started = true;
                setMessages(prev => [...prev, { role: 'assistant', content: acc }]);
              } else {
                setMessages(prev => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m)));
              }
            }
          } catch { /* partial */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error de conexión con el coach.' }]);
    }
    setLoading(false);
  };

  const proteinAlert = (() => {
    const w = Number(profile.weight);
    if (!w) return null;
    const minP = Math.round(w * 1.6);
    return `Para tu objetivo se recomienda al menos ~${minP} g de proteína al día.`;
  })();

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-6">
              🧠 Asistente IA personalizado
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Coach Virtual <span className="glow-text">Inteligente</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Resuelve tus dudas sobre nutrición, entrenamiento y hábitos. Adaptado a tus datos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat */}
            <div className="lg:col-span-2 glass-card flex flex-col h-[640px]">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold">AI</div>
                  <div>
                    <div className="font-display font-bold text-foreground">Coach IA</div>
                    <div className="text-xs text-accent flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> En línea
                    </div>
                  </div>
                </div>
                <button onClick={() => setProfileOpen(o => !o)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {profileOpen ? 'Cerrar perfil' : '⚙️ Mi perfil'}
                </button>
              </div>

              {profileOpen && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3 animate-fade-in-up">
                  {[
                    { k: 'weight', p: 'Peso (kg)' },
                    { k: 'height', p: 'Altura (cm)' },
                    { k: 'age', p: 'Edad' },
                    { k: 'calories', p: 'kcal/día' },
                    { k: 'goal', p: 'Objetivo' },
                  ].map(f => (
                    <input
                      key={f.k}
                      placeholder={f.p}
                      value={(profile as any)[f.k]}
                      onChange={e => setProfile(p => ({ ...p, [f.k]: e.target.value }))}
                      className="input-field !py-2 !text-sm"
                    />
                  ))}
                </div>
              )}

              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-secondary text-background rounded-br-sm'
                          : 'bg-muted border border-border text-foreground rounded-bl-sm'
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="flex justify-start">
                    <div className="bg-muted border border-border px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse [animation-delay:0.3s]" />
                    </div>
                  </div>
                )}
              </div>

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {SUGGESTED.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <form
                onSubmit={e => { e.preventDefault(); send(input); }}
                className="flex gap-2 mt-3 pt-3 border-t border-border"
              >
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Pregunta a tu coach..."
                  className="input-field"
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()} className="btn-primary !py-3 !px-6 disabled:opacity-50">
                  ↑
                </button>
              </form>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="glass-card">
                <h4 className="font-display font-bold text-foreground mb-3">📊 Indicadores</h4>
                <div className="space-y-3">
                  <Indicator label="Hidratación" value="Buena" pct={75} color="primary" />
                  <Indicator label="Proteína estimada" value={profile.weight ? 'Por revisar' : 'Sin datos'} pct={profile.weight ? 60 : 20} color="secondary" />
                  <Indicator label="Actividad" value="Moderada" pct={55} color="accent" />
                </div>
              </div>

              {proteinAlert && (
                <div className="glass-card !p-4 border border-secondary/30 bg-secondary/5">
                  <div className="text-xs text-secondary font-bold mb-1">⚠️ ALERTA INTELIGENTE</div>
                  <p className="text-sm text-foreground">{proteinAlert}</p>
                </div>
              )}

              <div className="glass-card">
                <h4 className="font-display font-bold text-foreground mb-3">💡 Consejos automáticos</h4>
                <div className="space-y-3">
                  {HEALTH_TIPS.map(t => (
                    <div key={t.title} className="p-3 rounded-lg bg-muted border border-border">
                      <div className="text-sm font-semibold text-foreground">{t.icon} {t.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{t.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Indicator({ label, value, pct, color }: { label: string; value: string; pct: number; color: 'primary' | 'secondary' | 'accent' }) {
  const bg = color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-accent';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${bg} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}