export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export type Gender = 'male' | 'female';
export type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface CalculatorInput {
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  activity: Activity;
  goal: Goal;
}

export interface CalculatorResult {
  bmr: number;
  tdee: number;
  target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  goal: Goal;
}
