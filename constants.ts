import { Category } from './types';

export const EXPENSE_CATEGORIES = [
  Category.Vivienda,
  Category.Alimentacion,
  Category.Transporte,
  Category.Salud,
  Category.Educacion,
  Category.Ocio,
  Category.Otros
];

export const INCOME_CATEGORIES = [
  Category.Salario,
  Category.Negocios,
  Category.Inversion,
  Category.Regalos,
  Category.Otros
];

export const SAVINGS_GOAL_PERCENTAGE = 0.20; // 20% savings goal

export const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  // Expenses
  [Category.Vivienda]: '#ef4444', // Red
  [Category.Alimentacion]: '#f97316', // Orange
  [Category.Transporte]: '#eab308', // Yellow
  [Category.Salud]: '#14b8a6', // Teal
  [Category.Educacion]: '#3b82f6', // Blue
  [Category.Ocio]: '#8b5cf6', // Violet
  [Category.Otros]: '#64748b', // Slate
  
  // Income
  [Category.Salario]: '#10b981', // Emerald
  [Category.Negocios]: '#06b6d4', // Cyan
  [Category.Inversion]: '#6366f1', // Indigo
  [Category.Regalos]: '#ec4899', // Pink
  [Category.OtrosIngresos]: '#84cc16', // Lime
  
  // System / General
  'Ingresos': '#10b981',
  'Gastos': '#ef4444'
};