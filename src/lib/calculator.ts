import { CalculatorInput, CalculatorResult } from './models';

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const MOTIVATIONS = [
  'Cada caloría cuenta en tu camino al éxito 💪',
  'El conocimiento de tu metabolismo es el primer paso 🔬',
  'Tu meta está al alcance, sigue el plan 🎯',
  'La constancia supera al talento ⚡',
  'Hoy es un buen día para empezar 🌟',
];

const TIPS: Record<string, string> = {
  lose: 'Distribuye tus comidas en 4-5 tomas para mantener activo tu metabolismo.',
  maintain: 'La consistencia es clave. Mantén horarios regulares de comida.',
  gain: 'Prioriza proteínas post-entrenamiento para maximizar la síntesis muscular.',
};

export function calculate(data: CalculatorInput): CalculatorResult {
  const base = 10 * data.weight + 6.25 * data.height - 5 * data.age;
  const bmr = data.gender === 'male' ? base + 5 : base - 161;
  const tdee = bmr * ACTIVITY_FACTORS[data.activity];
  const target = tdee + GOAL_ADJUSTMENTS[data.goal];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target: Math.round(target),
    protein_g: Math.round((target * 0.25) / 4),
    carbs_g: Math.round((target * 0.45) / 4),
    fat_g: Math.round((target * 0.30) / 9),
    goal: data.goal,
  };
}

export function getRandomMotivation(): string {
  return MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
}

export function getTip(goal: string): string {
  return TIPS[goal] ?? '';
}
