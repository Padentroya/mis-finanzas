import { Transaction, TransactionType } from '../types';

export const parseCSV = (csvContent: string): Transaction[] => {
  const lines = csvContent.split(/\r?\n/);
  const transactions: Transaction[] = [];
  
  // Try to detect if the first line is a header
  // Heuristic: check if the first character of the first line is NOT a number
  let startIdx = 0;
  if (lines.length > 0) {
      const firstLine = lines[0].trim();
      const firstChar = firstLine[0];
      // If starts with a letter (like 'D' for Date or 'F' for Fecha), assume header
      if (firstChar && isNaN(parseInt(firstChar))) {
          startIdx = 1;
      }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    
    // Expected simple CSV format: 
    // Date (YYYY-MM-DD), Amount, Type (income/expense), Category, Description
    if (parts.length < 2) continue;

    const getVal = (idx: number) => parts[idx] ? parts[idx].trim().replace(/^"|"$/g, '') : '';

    const dateStr = getVal(0);
    const amountStr = getVal(1);
    const typeStr = getVal(2).toLowerCase();
    const category = getVal(3) || 'Otros';
    const description = getVal(4) || 'Importado via CSV';

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) continue;

    // Determine type
    let type: TransactionType = 'expense';
    if (typeStr === 'income' || typeStr === 'ingreso' || typeStr === 'ingresos') {
        type = 'income';
    } else if (typeStr === 'expense' || typeStr === 'gasto' || typeStr === 'gastos') {
        type = 'expense';
    }

    // Validate Date
    let date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        date = new Date(); // Fallback to current date if invalid
    }

    // Generate a simple ID
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);

    transactions.push({
      id,
      date: date.toISOString(),
      amount: Math.abs(amount),
      type,
      category,
      description
    });
  }

  return transactions;
};