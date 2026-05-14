import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Goal = 'fatloss' | 'maintain' | 'muscle' | 'fitness';
type Level = 'beginner' | 'intermediate' | 'advanced';
type Limitation =
  | 'knee'
  | 'lumbar'
  | 'obesity'
  | 'sedentary'
  | 'hypertension'
  | 'mobility';

const GOALS: { id: Goal; label: string; icon: string; desc: string }[] = [
  { id: 'fatloss', label: 'Pérdida de grasa', icon: '🔥', desc: 'Déficit calórico + cardio' },
  { id: 'maintain', label: 'Mantenimiento', icon: '⚖️', desc: 'Equilibrio y constancia' },
  { id: 'muscle', label: 'Ganancia muscular', icon: '💪', desc: 'Hipertrofia progresiva' },
  { id: 'fitness', label: 'Mejor condición física', icon: '⚡', desc: 'Resistencia y movilidad' },
];

const LEVELS: { id: Level; label: string; desc: string }[] = [
  { id: 'beginner', label: 'Principiante', desc: '0-3 meses entrenando' },
  { id: 'intermediate', label: 'Intermedio', desc: '3-12 meses constantes' },
  { id: 'advanced', label: 'Avanzado', desc: '+1 año entrenando' },
];

const LIMITATIONS: { id: Limitation; label: string; icon: string }[] = [
  { id: 'knee', label: 'Dolor de rodilla', icon: '🦵' },
  { id: 'lumbar', label: 'Dolor lumbar', icon: '🩺' },
  { id: 'obesity', label: 'Obesidad', icon: '⚕️' },
  { id: 'sedentary', label: 'Sedentarismo', icon: '🪑' },
  { id: 'hypertension', label: 'Hipertensión', icon: '❤️' },
  { id: 'mobility', label: 'Movilidad reducida', icon: '♿' },
];

type Exercise = {
  name: string;
  type: string;
  intensity: 'Baja' | 'Media' | 'Alta';
  duration: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  kcal: number;
  icon: string;
  tags: string[]; // matches goal/level/limitation context
};

const EXERCISE_LIBRARY: Exercise[] = [
  { name: 'Caminata rápida', type: 'Cardio', intensity: 'Baja', duration: '30-45 min', difficulty: 1, kcal: 180, icon: '🚶', tags: ['low-impact', 'beginner', 'fatloss', 'fitness', 'sedentary', 'obesity', 'knee'] },
  { name: 'Bicicleta estática', type: 'Cardio', intensity: 'Media', duration: '25-40 min', difficulty: 2, kcal: 280, icon: '🚴', tags: ['low-impact', 'fatloss', 'fitness', 'knee', 'obesity'] },
  { name: 'Natación', type: 'Cardio', intensity: 'Media', duration: '30 min', difficulty: 2, kcal: 320, icon: '🏊', tags: ['low-impact', 'fitness', 'lumbar', 'knee', 'mobility', 'hypertension'] },
  { name: 'Yoga & Movilidad', type: 'Movilidad', intensity: 'Baja', duration: '20-30 min', difficulty: 1, kcal: 120, icon: '🧘', tags: ['low-impact', 'beginner', 'mobility', 'lumbar', 'hypertension'] },
  { name: 'HIIT funcional', type: 'Cardio', intensity: 'Alta', duration: '20 min', difficulty: 4, kcal: 380, icon: '🔥', tags: ['high-impact', 'advanced', 'intermediate', 'fatloss', 'fitness'] },
  { name: 'Sentadillas con peso', type: 'Fuerza', intensity: 'Media', duration: '4x10', difficulty: 3, kcal: 220, icon: '🏋️', tags: ['muscle', 'intermediate', 'advanced', 'fitness'] },
  { name: 'Press banca', type: 'Fuerza', intensity: 'Alta', duration: '4x8', difficulty: 4, kcal: 200, icon: '💪', tags: ['muscle', 'intermediate', 'advanced'] },
  { name: 'Peso muerto rumano', type: 'Fuerza', intensity: 'Alta', duration: '4x8', difficulty: 4, kcal: 240, icon: '🏋️‍♀️', tags: ['muscle', 'advanced'] },
  { name: 'Plancha abdominal', type: 'Core', intensity: 'Media', duration: '3x45 s', difficulty: 2, kcal: 80, icon: '🧱', tags: ['fitness', 'muscle', 'beginner', 'intermediate', 'lumbar'] },
  { name: 'Estiramiento guiado', type: 'Recuperación', intensity: 'Baja', duration: '15 min', difficulty: 1, kcal: 60, icon: '🌿', tags: ['recovery', 'lumbar', 'mobility', 'hypertension', 'beginner'] },
  { name: 'Elíptica', type: 'Cardio', intensity: 'Media', duration: '30 min', difficulty: 2, kcal: 290, icon: '🏃', tags: ['low-impact', 'fatloss', 'fitness', 'knee', 'obesity'] },
  { name: 'Remo con mancuerna', type: 'Fuerza', intensity: 'Media', duration: '4x10', difficulty: 3, kcal: 210, icon: '🚣', tags: ['muscle', 'intermediate', 'advanced', 'fitness'] },
];

function calcBMI(weight: number, heightCm: number) {
  const h = heightCm / 100;
  if (!h || !weight || h <= 0 || weight <= 0) return 0;
  return weight / (h * h);
}

function intensityColor(i: Exercise['intensity']) {
  if (i === 'Baja') return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
  if (i === 'Media') return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
  return 'text-rose-400 border-rose-400/30 bg-rose-400/10';
}

export default function AdaptiveTrainer() {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(28);
  const [calories, setCalories] = useState(2200);
  const [activity, setActivity] = useState(2); // 0-4
  const [goal, setGoal] = useState<Goal>('fatloss');
  const [level, setLevel] = useState<Level>('beginner');
  const [limits, setLimits] = useState<Set<Limitation>>(new Set());

  const toggleLimit = (l: Limitation) => {
    setLimits(prev => {
      const next = new Set(prev);
      next.has(l) ? next.delete(l) : next.add(l);
      return next;
    });
  };

  const bmi = useMemo(() => calcBMI(weight, height), [weight, height]);

  const recommendations = useMemo(() => {
    const recs: { type: 'info' | 'warn' | 'good'; text: string }[] = [];

    if (limits.has('knee')) recs.push({ type: 'warn', text: 'Se recomiendan ejercicios de bajo impacto debido a molestias en rodilla.' });
    if (limits.has('lumbar')) recs.push({ type: 'warn', text: 'Evita cargas axiales pesadas y prioriza fortalecimiento del core.' });
    if (limits.has('hypertension')) recs.push({ type: 'warn', text: 'Mantén intensidad moderada y controla la respiración. Evita Valsalva.' });
    if (limits.has('mobility')) recs.push({ type: 'info', text: 'Comienza con movilidad articular y ejercicios en silla o asistidos.' });
    if (limits.has('obesity') || bmi >= 30) recs.push({ type: 'warn', text: 'Prioriza cardio de bajo impacto y progresión gradual para cuidar articulaciones.' });
    if (limits.has('sedentary') || activity <= 1) recs.push({ type: 'info', text: 'Tu nivel actual es ideal para iniciar con caminatas y ejercicios funcionales.' });

    if (goal === 'fatloss') recs.push({ type: 'good', text: 'Combina cardio moderado 3-4 días con fuerza ligera 2 días para optimizar la pérdida de grasa.' });
    if (goal === 'muscle') recs.push({ type: 'good', text: 'Enfoca tu plan en fuerza progresiva 4-5 días por semana con descanso adecuado.' });
    if (goal === 'fitness') recs.push({ type: 'good', text: 'Se recomienda aumentar progresivamente la intensidad cardiovascular semana a semana.' });
    if (goal === 'maintain') recs.push({ type: 'good', text: 'Mantén una rutina mixta 3-4 días equilibrando fuerza, cardio y movilidad.' });

    if (level === 'beginner') recs.push({ type: 'info', text: 'Empieza con 2-3 sesiones por semana de 20-30 min y aumenta gradualmente.' });
    if (level === 'advanced' && activity < 3) recs.push({ type: 'warn', text: 'Tu actividad actual es baja para tu nivel: aumenta volumen e intensidad.' });

    if (calories < 1500 && goal !== 'fatloss') recs.push({ type: 'warn', text: 'Tu ingesta calórica parece baja para tu objetivo, podrías comprometer rendimiento.' });

    return recs;
  }, [goal, level, limits, activity, bmi, calories]);

  const filteredExercises = useMemo(() => {
    const lowImpact = limits.has('knee') || limits.has('lumbar') || limits.has('obesity') || limits.has('mobility') || limits.has('hypertension');
    return EXERCISE_LIBRARY.filter(ex => {
      if (lowImpact && ex.tags.includes('high-impact')) return false;
      if (level === 'beginner' && ex.difficulty >= 4) return false;
      if (goal === 'muscle' && ex.type === 'Cardio' && ex.intensity === 'Alta') return false;
      if (goal === 'fatloss' && ex.tags.includes('muscle') && !ex.tags.includes('fatloss') && !ex.tags.includes('fitness')) {
        // keep some strength
        return ex.difficulty <= 3;
      }
      return (
        ex.tags.includes(goal) ||
        ex.tags.includes(level) ||
        ex.tags.includes('low-impact') ||
        Array.from(limits).some(l => ex.tags.includes(l))
      );
    }).slice(0, 8);
  }, [goal, level, limits]);

  const alerts = useMemo(() => {
    const a: string[] = [];
    if (limits.has('knee') || limits.has('lumbar')) a.push('Evita ejercicios de alto impacto.');
    if (activity <= 1 && (goal === 'fatloss' || goal === 'fitness')) a.push('Tu actividad física actual podría ser insuficiente para tu objetivo.');
    if (level === 'advanced' || goal === 'muscle') a.push('Se recomienda incluir días de recuperación activa entre sesiones.');
    if (limits.has('hypertension')) a.push('Monitorea tu frecuencia cardíaca y evita esfuerzos máximos.');
    if (a.length === 0) a.push('Sin alertas críticas. Mantén constancia y escucha a tu cuerpo.');
    return a;
  }, [limits, activity, goal, level]);

  const weeklyPlan = useMemo(() => {
    const days = level === 'beginner' ? 3 : level === 'intermediate' ? 4 : 5;
    const focus = goal === 'muscle' ? 'Fuerza' : goal === 'fatloss' ? 'Cardio + Fuerza' : goal === 'fitness' ? 'Funcional' : 'Mixto';
    return { days, focus };
  }, [goal, level]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary/20 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-primary font-semibold">IA Adaptativa · Premium</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
            Entrenador Físico Adaptativo
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Recomendaciones personalizadas en tiempo real basadas en tu cuerpo, objetivos y limitaciones.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 pb-24 space-y-8">
        {/* PERFIL CORPORAL */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold">Tu perfil corporal</h2>
            <div className="text-xs text-muted-foreground">IMC: <span className="text-primary font-bold">{bmi.toFixed(1)}</span></div>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { label: 'Peso (kg)', value: weight, set: setWeight, min: 30, max: 200 },
              { label: 'Altura (cm)', value: height, set: setHeight, min: 120, max: 220 },
              { label: 'Edad', value: age, set: setAge, min: 12, max: 90 },
              { label: 'Calorías/día', value: calories, set: setCalories, min: 1000, max: 5000 },
            ].map(f => (
              <label key={f.label} className="block">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{f.label}</span>
                <input
                  type="number"
                  value={f.value}
                  min={f.min}
                  max={f.max}
                  onChange={e => f.set(Number(e.target.value))}
                  className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition"
                />
              </label>
            ))}
            <label className="block">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Actividad</span>
              <select
                value={activity}
                onChange={e => setActivity(Number(e.target.value))}
                className="mt-1 w-full bg-background/60 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary focus:outline-none transition"
              >
                <option value={0}>Sedentaria</option>
                <option value={1}>Ligera</option>
                <option value={2}>Moderada</option>
                <option value={3}>Alta</option>
                <option value={4}>Muy alta</option>
              </select>
            </label>
          </div>
        </div>

        {/* OBJETIVO */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
          <h2 className="font-display text-2xl font-bold mb-6">Objetivo físico</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GOALS.map(g => {
              const active = goal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`group text-left p-5 rounded-2xl border transition-all duration-300 hover-scale ${
                    active
                      ? 'border-primary bg-gradient-to-br from-primary/20 to-secondary/10 shadow-[0_0_30px_-10px_hsl(var(--primary))]'
                      : 'border-border bg-background/40 hover:border-primary/40'
                  }`}
                >
                  <div className="text-3xl mb-2">{g.icon}</div>
                  <div className="font-semibold mb-1">{g.label}</div>
                  <div className="text-xs text-muted-foreground">{g.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* NIVEL */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
          <h2 className="font-display text-2xl font-bold mb-6">Nivel de experiencia</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {LEVELS.map(l => {
              const active = level === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`p-5 rounded-2xl border transition-all duration-300 text-left ${
                    active
                      ? 'border-secondary bg-gradient-to-br from-secondary/20 to-primary/10 shadow-[0_0_30px_-10px_hsl(var(--secondary))]'
                      : 'border-border bg-background/40 hover:border-secondary/40'
                  }`}
                >
                  <div className="font-semibold mb-1">{l.label}</div>
                  <div className="text-xs text-muted-foreground">{l.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* LIMITACIONES */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
          <h2 className="font-display text-2xl font-bold mb-2">Limitaciones o condiciones</h2>
          <p className="text-sm text-muted-foreground mb-6">Selecciona las que apliquen para personalizar tus recomendaciones.</p>
          <div className="flex flex-wrap gap-3">
            {LIMITATIONS.map(l => {
              const active = limits.has(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLimit(l.id)}
                  className={`px-5 py-3 rounded-full border text-sm transition-all duration-300 flex items-center gap-2 ${
                    active
                      ? 'border-primary bg-primary/20 text-primary shadow-[0_0_20px_-8px_hsl(var(--primary))]'
                      : 'border-border bg-background/40 text-muted-foreground hover:text-foreground hover:border-primary/40'
                  }`}
                >
                  <span>{l.icon}</span> {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* PLAN SEMANAL + ALERTAS */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/40 to-secondary/10 backdrop-blur-xl p-8 animate-fade-in">
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">Plan inteligente</div>
            <div className="text-5xl font-display font-bold mb-1">{weeklyPlan.days}<span className="text-lg text-muted-foreground"> días/sem</span></div>
            <div className="text-muted-foreground mb-6">Enfoque: <span className="text-foreground font-semibold">{weeklyPlan.focus}</span></div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">IMC</span><span className="font-semibold">{bmi.toFixed(1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Calorías</span><span className="font-semibold">{calories} kcal</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Limitaciones</span><span className="font-semibold">{limits.size || 'Ninguna'}</span></div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
            <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Alertas inteligentes
            </h3>
            <ul className="space-y-3">
              {alerts.map((a, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-background/40 border border-border">
                  <span className="w-2 h-2 mt-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RECOMENDACIONES */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
          <h2 className="font-display text-2xl font-bold mb-6">Recomendaciones personalizadas</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((r, i) => {
              const tone =
                r.type === 'warn'
                  ? 'border-amber-400/30 bg-amber-400/5 text-amber-200'
                  : r.type === 'good'
                  ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-200'
                  : 'border-primary/30 bg-primary/5 text-foreground';
              const icon = r.type === 'warn' ? '⚠️' : r.type === 'good' ? '✅' : '💡';
              return (
                <div key={i} className={`p-4 rounded-xl border ${tone} flex items-start gap-3 animate-fade-in`}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm leading-relaxed">{r.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* EJERCICIOS */}
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur-xl p-8 animate-fade-in">
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold">Ejercicios sugeridos</h2>
              <p className="text-sm text-muted-foreground">Adaptados a tu objetivo, nivel y limitaciones</p>
            </div>
            <span className="text-xs text-muted-foreground">{filteredExercises.length} ejercicios</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredExercises.map((ex, i) => (
              <div
                key={i}
                className="group relative p-5 rounded-2xl border border-border bg-gradient-to-br from-background/60 to-card/40 backdrop-blur-md hover:border-primary/50 transition-all duration-300 hover-scale overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition" />
                <div className="relative">
                  <div className="text-3xl mb-3">{ex.icon}</div>
                  <div className="font-display font-bold mb-1">{ex.name}</div>
                  <div className="text-xs text-muted-foreground mb-3">{ex.type}</div>
                  <div className={`inline-block text-xs px-2 py-0.5 rounded-full border ${intensityColor(ex.intensity)} mb-3`}>
                    {ex.intensity}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-background/50 rounded-lg p-2 border border-border">
                      <div className="text-muted-foreground">Duración</div>
                      <div className="font-semibold">{ex.duration}</div>
                    </div>
                    <div className="bg-background/50 rounded-lg p-2 border border-border">
                      <div className="text-muted-foreground">Kcal</div>
                      <div className="font-semibold">{ex.kcal}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, k) => (
                        <span key={k} className={`w-1.5 h-3 rounded-sm ${k < ex.difficulty ? 'bg-primary' : 'bg-border'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Dif. {ex.difficulty}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA COACH */}
        <div className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-br from-primary/20 via-card/40 to-secondary/20 backdrop-blur-xl p-10 text-center animate-fade-in">
          <div className="absolute inset-0 -z-10 opacity-40">
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary/30 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-secondary/30 blur-3xl" />
          </div>
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">¿Dudas sobre tu rutina?</h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Habla con tu Coach Virtual Inteligente: ejercicios adaptados, intensidad, recuperación y hábitos saludables.
          </p>
          <Link
            to="/virtual-coach"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold no-underline hover-scale shadow-[0_10px_40px_-10px_hsl(var(--primary))]"
          >
            Hablar con el Coach IA →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}