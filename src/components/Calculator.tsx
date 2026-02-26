import { useState } from 'react';
import { calculate, getRandomMotivation, getTip } from '@/lib/calculator';
import { CalculatorResult, Gender, Activity, Goal } from '@/lib/models';

const activityOptions = [
  { value: 'sedentary' as Activity, label: 'Sedentario', desc: 'Sin ejercicio', factor: '×1.2' },
  { value: 'light' as Activity, label: 'Ligero', desc: '1-3 días/semana', factor: '×1.375' },
  { value: 'moderate' as Activity, label: 'Moderado', desc: '3-5 días/semana', factor: '×1.55' },
  { value: 'active' as Activity, label: 'Activo', desc: '6-7 días/semana', factor: '×1.725' },
  { value: 'very_active' as Activity, label: 'Muy activo', desc: 'Trabajo físico intenso', factor: '×1.9' },
];

const goalOptions = [
  { value: 'lose' as Goal, label: '🔴 Perder peso', adj: '−500 kcal' },
  { value: 'maintain' as Goal, label: '⚖️ Mantener', adj: '±0 kcal' },
  { value: 'gain' as Goal, label: '🟢 Ganar músculo', adj: '+300 kcal' },
];

export function Calculator() {
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<Activity>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [motivation, setMotivation] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isInvalid = (field: string, value: string, min: number, max: number) => {
    if (!touched[field]) return false;
    const n = Number(value);
    return !value || isNaN(n) || n < min || n > max;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ age: true, weight: true, height: true });
    const a = Number(age), w = Number(weight), h = Number(height);
    if (!a || a < 10 || a > 100 || !w || w < 30 || w > 200 || !h || h < 100 || h > 250) return;
    const r = calculate({ gender, age: a, weight: w, height: h, activity, goal });
    setResult(r);
    setMotivation(getRandomMotivation());
  };

  const totalMacros = result ? result.protein_g * 4 + result.carbs_g * 4 + result.fat_g * 9 : 0;

  return (
    <section id="calculator" className="relative z-10 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Calcula tus <span className="glow-text">calorías</span>
          </h2>
          <p className="text-muted-foreground">Fórmula Mifflin-St Jeor</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={onSubmit} className="glass-card space-y-6">
            {/* Gender */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Género biológico</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setGender('male')}
                  className={`py-3 rounded-lg font-display font-semibold text-sm transition-all cursor-pointer border ${
                    gender === 'male'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground hover:border-primary/50'
                  }`}>
                  ♂ Masculino
                </button>
                <button type="button" onClick={() => setGender('female')}
                  className={`py-3 rounded-lg font-display font-semibold text-sm transition-all cursor-pointer border ${
                    gender === 'female'
                      ? 'bg-secondary/10 border-secondary text-secondary'
                      : 'bg-muted border-border text-muted-foreground hover:border-secondary/50'
                  }`}>
                  ♀ Femenino
                </button>
              </div>
            </div>

            {/* Numeric inputs */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'age', label: 'Edad', value: age, set: setAge, unit: 'años', min: 10, max: 100, err: 'Entre 10 y 100' },
                { id: 'weight', label: 'Peso', value: weight, set: setWeight, unit: 'kg', min: 30, max: 200, err: 'Entre 30 y 200 kg' },
                { id: 'height', label: 'Altura', value: height, set: setHeight, unit: 'cm', min: 100, max: 250, err: 'Entre 100 y 250 cm' },
              ].map(f => (
                <div key={f.id}>
                  <label className="text-sm text-muted-foreground block mb-1">{f.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={f.value}
                      onChange={e => f.set(e.target.value)}
                      onBlur={() => setTouched(t => ({ ...t, [f.id]: true }))}
                      placeholder="—"
                      className="input-field !pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{f.unit}</span>
                  </div>
                  {isInvalid(f.id, f.value, f.min, f.max) && (
                    <span className="text-destructive text-xs mt-1 block">{f.err}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Activity */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Nivel de actividad física</label>
              <div className="space-y-2">
                {activityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setActivity(opt.value)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer text-left ${
                      activity === opt.value
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted border-border hover:border-primary/30'
                    }`}
                  >
                    <div>
                      <div className={`text-sm font-semibold ${activity === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{opt.factor}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="text-sm text-muted-foreground block mb-2">Objetivo</label>
              <div className="grid grid-cols-3 gap-3">
                {goalOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGoal(opt.value)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-center ${
                      goal === opt.value
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted border-border hover:border-primary/30'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${goal === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}>{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{opt.adj}</div>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full">
              Calcular mis calorías →
            </button>
          </form>

          {/* Results */}
          <div className="glass-card flex flex-col justify-center">
            {!result ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-muted-foreground">Completa el formulario para ver tus resultados personalizados</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                <h3 className="font-display text-xl font-bold text-foreground">Tus resultados</h3>

                <div className="text-center p-6 rounded-xl bg-muted border border-border">
                  <div className="text-sm text-muted-foreground mb-1">Calorías Objetivo</div>
                  <div className="text-4xl font-display font-bold glow-text">{result.target.toLocaleString()}</div>
                  <div className="text-muted-foreground text-sm">kcal/día</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted border border-border text-center">
                    <div className="text-xs text-muted-foreground">BMR</div>
                    <div className="text-lg font-display font-bold text-foreground">{result.bmr.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted border border-border text-center">
                    <div className="text-xs text-muted-foreground">TDEE</div>
                    <div className="text-lg font-display font-bold text-foreground">{result.tdee.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">kcal</div>
                  </div>
                </div>

                {/* Macros bar */}
                <div>
                  <div className="flex h-4 rounded-full overflow-hidden mb-3">
                    <div className="bg-primary" style={{ width: `${(result.protein_g * 4 / totalMacros) * 100}%` }} />
                    <div className="bg-secondary" style={{ width: `${(result.carbs_g * 4 / totalMacros) * 100}%` }} />
                    <div className="bg-accent" style={{ width: `${(result.fat_g * 9 / totalMacros) * 100}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{result.protein_g}g</div>
                      <div className="text-xs text-muted-foreground">Proteína 25%</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary">{result.carbs_g}g</div>
                      <div className="text-xs text-muted-foreground">Carbos 45%</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-accent">{result.fat_g}g</div>
                      <div className="text-xs text-muted-foreground">Grasas 30%</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted border border-border">
                  <p className="text-sm text-muted-foreground">💡 {getTip(result.goal)}</p>
                </div>

                <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
                  <p className="text-sm text-foreground">✨ {motivation}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
