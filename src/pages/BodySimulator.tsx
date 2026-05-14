import { useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Goal = 'lose' | 'maintain' | 'gain';

const ACTIVITY_FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9];
const ACTIVITY_LABELS = ['Sedentario', 'Ligero', 'Moderado', 'Activo', 'Muy activo'];

function bmrMifflin(weight: number, height: number, age: number) {
  return 10 * weight + 6.25 * height - 5 * age + 5;
}

export default function BodySimulator() {
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(28);
  const [activityIdx, setActivityIdx] = useState(2);
  const [calories, setCalories] = useState(2200);
  const [goal, setGoal] = useState<Goal>('lose');
  const [weeks, setWeeks] = useState(8);

  const sim = useMemo(() => {
    const bmr = bmrMifflin(weight, height, age);
    const tdee = bmr * ACTIVITY_FACTORS[activityIdx];
    const dailyDiff = calories - tdee; // negativo = déficit
    // 7700 kcal ≈ 1 kg de grasa
    const weeklyKg = (dailyDiff * 7) / 7700;
    const totalKg = weeklyKg * weeks;
    const finalWeight = weight + totalKg;
    const bmiFinal = finalWeight / Math.pow(height / 100, 2);
    const bmiNow = weight / Math.pow(height / 100, 2);

    const points = Array.from({ length: weeks + 1 }, (_, i) => ({
      week: i,
      weight: +(weight + weeklyKg * i).toFixed(2),
    }));

    let sustainability: 'sostenible' | 'agresivo' | 'lento' | 'desbalanceado' = 'sostenible';
    const absWeekly = Math.abs(weeklyKg);
    if (absWeekly > 1) sustainability = 'agresivo';
    else if (absWeekly < 0.2 && goal !== 'maintain') sustainability = 'lento';
    if ((goal === 'lose' && dailyDiff > 0) || (goal === 'gain' && dailyDiff < 0)) {
      sustainability = 'desbalanceado';
    }

    const messages: { type: 'good' | 'warn' | 'info'; text: string }[] = [];
    if (goal === 'lose') {
      if (dailyDiff < 0) {
        messages.push({ type: 'good', text: `Con este déficit podrías perder aproximadamente ${Math.abs(totalKg).toFixed(1)} kg en ${weeks} semanas.` });
      } else {
        messages.push({ type: 'warn', text: 'Tus calorías superan tu gasto: con este plan no perderías peso.' });
      }
    }
    if (goal === 'gain') {
      if (dailyDiff > 0) {
        messages.push({ type: 'good', text: `Con este superávit podrías ganar aproximadamente ${totalKg.toFixed(1)} kg en ${weeks} semanas.` });
        messages.push({ type: 'info', text: 'Este objetivo podría requerir un mayor consumo proteico (1.6 – 2.2 g/kg).' });
      } else {
        messages.push({ type: 'warn', text: 'Estás en déficit: difícilmente ganarás masa con estas calorías.' });
      }
    }
    if (goal === 'maintain') {
      messages.push({ type: 'info', text: `Tu mantenimiento estimado es ~${Math.round(tdee)} kcal/día.` });
    }
    if (sustainability === 'agresivo') {
      messages.push({ type: 'warn', text: 'El ritmo es muy agresivo (>1 kg/semana), podría afectar tu salud o masa muscular.' });
    } else if (sustainability === 'sostenible') {
      messages.push({ type: 'good', text: 'Tu progreso estimado es sostenible y saludable.' });
    } else if (sustainability === 'lento') {
      messages.push({ type: 'info', text: 'Ritmo lento: ajusta calorías o actividad para resultados más visibles.' });
    }
    if (bmiFinal < 18.5) messages.push({ type: 'warn', text: 'IMC final estimado por debajo del rango saludable.' });
    if (bmiFinal >= 25 && bmiFinal < 30) messages.push({ type: 'info', text: 'IMC final en rango de sobrepeso.' });
    if (bmiFinal >= 30) messages.push({ type: 'warn', text: 'IMC final en rango de obesidad.' });

    return { bmr, tdee, dailyDiff, weeklyKg, totalKg, finalWeight, bmiNow, bmiFinal, points, sustainability, messages };
  }, [weight, height, age, activityIdx, calories, goal, weeks]);

  // Build SVG line for weight evolution
  const chart = useMemo(() => {
    const w = 600, h = 220, pad = 32;
    const xs = sim.points.map(p => p.week);
    const ys = sim.points.map(p => p.weight);
    const minY = Math.min(...ys) - 1;
    const maxY = Math.max(...ys) + 1;
    const xScale = (x: number) => pad + (x / Math.max(1, weeks)) * (w - pad * 2);
    const yScale = (y: number) => h - pad - ((y - minY) / Math.max(0.001, maxY - minY)) * (h - pad * 2);
    const path = sim.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xScale(p.week)} ${yScale(p.weight)}`).join(' ');
    const area = `${path} L ${xScale(xs[xs.length - 1])} ${h - pad} L ${xScale(xs[0])} ${h - pad} Z`;
    return { w, h, path, area, xScale, yScale, minY, maxY };
  }, [sim.points, weeks]);

  const SliderRow = ({ label, value, min, max, step, onChange, unit, hint }: any) => (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-sm text-muted-foreground">{label}</label>
        <span className="font-display text-lg font-bold glow-text">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-6">
              🧬 Simulación predictiva en tiempo real
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Simulador <span className="glow-text">Corporal Predictivo</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ajusta las variables y visualiza cómo evolucionarían tu peso, calorías y composición corporal.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="glass-card space-y-6">
              <h3 className="font-display text-xl font-bold text-foreground">Variables</h3>

              <SliderRow label="Peso actual" value={weight} min={40} max={180} step={0.5} onChange={setWeight} unit=" kg" />
              <SliderRow label="Altura" value={height} min={140} max={210} step={1} onChange={setHeight} unit=" cm" />
              <SliderRow label="Edad" value={age} min={15} max={80} step={1} onChange={setAge} unit=" años" />

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-sm text-muted-foreground">Nivel de actividad</label>
                  <span className="font-display text-sm font-bold text-primary">{ACTIVITY_LABELS[activityIdx]}</span>
                </div>
                <input
                  type="range" min={0} max={4} step={1}
                  value={activityIdx}
                  onChange={(e) => setActivityIdx(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="text-xs text-muted-foreground mt-1">Factor ×{ACTIVITY_FACTORS[activityIdx]}</div>
              </div>

              <SliderRow label="Calorías diarias" value={calories} min={1200} max={4500} step={50} onChange={setCalories} unit=" kcal" />
              <SliderRow label="Tiempo estimado" value={weeks} min={2} max={52} step={1} onChange={setWeeks} unit=" sem" />

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Objetivo</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { v: 'lose', l: '🔴 Definición' },
                    { v: 'maintain', l: '⚖️ Mantener' },
                    { v: 'gain', l: '🟢 Volumen' },
                  ] as { v: Goal; l: string }[]).map(o => (
                    <button
                      key={o.v}
                      onClick={() => setGoal(o.v)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer text-sm font-semibold ${
                        goal === o.v ? 'bg-primary/10 border-primary text-foreground' : 'bg-muted border-border text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <MetricCard label="Δ Peso estimado" value={`${sim.totalKg >= 0 ? '+' : ''}${sim.totalKg.toFixed(1)} kg`} accent="primary" />
                <MetricCard label="Peso final" value={`${sim.finalWeight.toFixed(1)} kg`} accent="secondary" />
                <MetricCard label="Δ Calórico" value={`${sim.dailyDiff >= 0 ? '+' : ''}${Math.round(sim.dailyDiff)} kcal/día`} accent="accent" />
                <MetricCard label="Tiempo objetivo" value={`${weeks} sem`} accent="primary" />
              </div>

              <div className="glass-card">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-display font-bold text-foreground">Evolución corporal</h4>
                  <span className="text-xs text-muted-foreground">kg / semana: {sim.weeklyKg.toFixed(2)}</span>
                </div>
                <svg viewBox={`0 0 ${chart.w} ${chart.h}`} className="w-full h-auto">
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[0, 1, 2, 3].map(i => {
                    const y = 32 + i * ((chart.h - 64) / 3);
                    return <line key={i} x1={32} x2={chart.w - 32} y1={y} y2={y} stroke="hsl(var(--border))" strokeDasharray="3 4" />;
                  })}
                  <path d={chart.area} fill="url(#grad)" />
                  <path d={chart.path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} className="animate-[dash_1s_ease-out]" />
                  {sim.points.map((p, i) => (
                    <circle key={i} cx={chart.xScale(p.week)} cy={chart.yScale(p.weight)} r={3} fill="hsl(var(--secondary))" />
                  ))}
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground mt-2 px-8">
                  <span>Sem 0</span>
                  <span>Sem {weeks}</span>
                </div>
              </div>

              <div className="glass-card">
                <h4 className="font-display font-bold text-foreground mb-3">IMC proyectado</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Actual</div>
                    <div className="font-display text-2xl font-bold text-foreground">{sim.bmiNow.toFixed(1)}</div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">Proyectado</div>
                    <div className="font-display text-2xl font-bold glow-text">{sim.bmiFinal.toFixed(1)}</div>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden relative">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500"
                    style={{
                      left: `${Math.min(100, Math.max(0, ((sim.bmiNow - 15) / 25) * 100))}%`,
                      width: `${Math.min(100, Math.abs(((sim.bmiFinal - sim.bmiNow) / 25) * 100))}%`,
                      background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))',
                    }}
                  />
                </div>
              </div>

              <div className="glass-card space-y-3">
                <h4 className="font-display font-bold text-foreground mb-2">🤖 Recomendaciones inteligentes</h4>
                {sim.messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border text-sm ${
                      m.type === 'good'
                        ? 'bg-accent/10 border-accent/30 text-foreground'
                        : m.type === 'warn'
                        ? 'bg-destructive/10 border-destructive/30 text-foreground'
                        : 'bg-primary/10 border-primary/30 text-foreground'
                    }`}
                  >
                    {m.type === 'good' ? '✅ ' : m.type === 'warn' ? '⚠️ ' : '💡 '}{m.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent: 'primary' | 'secondary' | 'accent' }) {
  const color = accent === 'primary' ? 'text-primary' : accent === 'secondary' ? 'text-secondary' : 'text-accent';
  return (
    <div className="glass-card !p-4 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-display text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}