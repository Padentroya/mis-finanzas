
export type TransactionType = 'income' | 'expense';

export enum Category {
  Vivienda = 'Vivienda',
  Alimentacion = 'Alimentación',
  Transporte = 'Transporte',
  Ocio = 'Ocio',
  Salud = 'Salud',
  Educacion = 'Educación',
  Ahorro = 'Ahorro',
  Inversion = 'Inversión',
  Otros = 'Otros',
  Salario = 'Salario',
  Negocios = 'Negocios',
  Regalos = 'Regalos',
  OtrosIngresos = 'Otros Ingresos'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  description: string;
  date: string; // ISO String
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
}

export type BudgetMap = Record<string, number>;
export type CategoryColorMap = Record<string, string>;

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success' | 'bill';
  date: string;
  read: boolean;
  actionLabel?: string;
}

export interface GoogleSheetConfig {
  scriptUrl: string;
  lastSync?: string;
}
