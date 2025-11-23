import { Transaction } from '../types';

export const exportToCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
      alert("No hay transacciones para exportar.");
      return;
  }

  // Define headers compatible with the Import parser
  const headers = ['Fecha', 'Monto', 'Tipo', 'Categoría', 'Descripción', 'ID'];
  
  // Map transactions to rows
  const rows = transactions.map(t => [
    new Date(t.date).toISOString().split('T')[0], // YYYY-MM-DD
    t.amount.toString(),
    t.type === 'income' ? 'Ingreso' : 'Gasto',
    t.category,
    `"${(t.description || '').replace(/"/g, '""')}"`, // Escape quotes and handle commas inside text
    t.id
  ]);

  // Combine headers and rows with newlines
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create a Blob with the CSV content
  // Adding BOM (Byte Order Mark) \uFEFF ensures Excel reads UTF-8 characters (accents, emojis) correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `finanzas_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};