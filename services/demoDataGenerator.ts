import { Transaction, BudgetMap, Category } from '../types';

export const generateDemoData = (): { transactions: Transaction[], budgets: BudgetMap } => {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  // Helper to add transaction
  const addTx = (amount: number, type: 'income' | 'expense', category: string, desc: string, date: Date) => {
    transactions.push({
      id: crypto.randomUUID(),
      amount: Number(amount.toFixed(2)),
      type,
      category,
      description: desc,
      date: date.toISOString()
    });
  };

  // Generate 12 months of data
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11

    // 1. Salary (Income) - End of month
    addTx(1500, 'income', Category.Salario, 'Nómina mensual', new Date(year, month, 28));

    // 2. Housing (Vivienda)
    // Mortgage for 2nd property (40% pending)
    addTx(280, 'expense', Category.Vivienda, 'Hipoteca 2ª Vivienda', new Date(year, month, 5));
    // Maintenance/Utilities for Owned House 1
    addTx(120, 'expense', Category.Vivienda, 'Comunidad y Gastos Casa Principal', new Date(year, month, 3));
    addTx(90 + Math.random() * 30, 'expense', Category.Vivienda, 'Suministros (Luz/Agua)', new Date(year, month, 10));

    // 3. Health/Leisure (Salud/Ocio) - Gym
    // User specifically mentioned Gym under "Leisure" context, but usually fits in Health. 
    // We will put it in Salud to keep it distinct or Ocio if preferred. Let's use Salud for 'Gym'.
    addTx(120, 'expense', Category.Salud, 'Cuota Gimnasio Familiar', new Date(year, month, 2));

    // 4. Savings (10% target)
    addTx(150, 'expense', Category.Ahorro, 'Ahorro mensual (10%)', new Date(year, month, 1));

    // 5. Transport (2 Cars + 1 Moto)
    addTx(65 + Math.random() * 20, 'expense', Category.Transporte, 'Gasolina Coche 1', new Date(year, month, 12));
    addTx(65 + Math.random() * 20, 'expense', Category.Transporte, 'Gasolina Coche 2', new Date(year, month, 22));
    addTx(25 + Math.random() * 10, 'expense', Category.Transporte, 'Gasolina Moto', new Date(year, month, 15));

    // Yearly Insurance (distributed randomly in a specific month, e.g., March and September)
    if (month === 2) {
        addTx(350, 'expense', Category.Transporte, 'Seguro Coche 1', new Date(year, month, 10));
    }
    if (month === 8) {
        addTx(300, 'expense', Category.Transporte, 'Seguro Coche 2', new Date(year, month, 10));
        addTx(120, 'expense', Category.Transporte, 'Seguro Moto', new Date(year, month, 12));
    }

    // 6. Food (Alimentacion)
    // ~400 EUR total per month split in weekly shops
    addTx(95 + Math.random() * 20, 'expense', Category.Alimentacion, 'Supermercado Compra Semanal', new Date(year, month, 4));
    addTx(95 + Math.random() * 20, 'expense', Category.Alimentacion, 'Supermercado Compra Semanal', new Date(year, month, 11));
    addTx(95 + Math.random() * 20, 'expense', Category.Alimentacion, 'Supermercado Compra Semanal', new Date(year, month, 18));
    addTx(95 + Math.random() * 20, 'expense', Category.Alimentacion, 'Supermercado Compra Semanal', new Date(year, month, 25));

    // 7. Education (University child)
    // Tuition fees in September/February
    if (month === 8 || month === 1) { 
        addTx(450, 'expense', Category.Educacion, 'Matrícula Universidad', new Date(year, month, 15));
    }
    // Monthly allowance/books
    addTx(50, 'expense', Category.Educacion, 'Libros y material', new Date(year, month, 20));

    // 8. Ocio (Leisure)
    addTx(40 + Math.random() * 20, 'expense', Category.Ocio, 'Cena fuera', new Date(year, month, 14));
    addTx(20 + Math.random() * 10, 'expense', Category.Ocio, 'Streaming / Suscripciones', new Date(year, month, 5));
  }

  // Define budgets based on this profile
  const budgets: BudgetMap = {
    [Category.Vivienda]: 550, // Hipoteca (280) + Com. (120) + Utils (~100)
    [Category.Alimentacion]: 450,
    [Category.Transporte]: 250, // Gas + margin for maintenance
    [Category.Salud]: 150, // Gym (120) + Pharmacy
    [Category.Ocio]: 100,
    [Category.Educacion]: 200, // Averaged out
    [Category.Ahorro]: 150,
    [Category.Otros]: 50
  };

  return { transactions, budgets };
};