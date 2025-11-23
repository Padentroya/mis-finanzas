import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, CategoryColorMap } from '../types';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
  colors: CategoryColorMap;
}

interface MonthlyGroup {
  monthKey: string;
  timestamp: number;
  income: number;
  expense: number;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ transactions, colors }) => {
  const data = useMemo(() => {
    // 1. Group by Month (YYYY-MM)
    const grouped = transactions.reduce((acc, t) => {
      const dateObj = new Date(t.date);
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`; // "2023-11"
      
      if (!acc[monthKey]) {
        acc[monthKey] = { 
          monthKey, 
          timestamp: dateObj.getTime(), // For sorting
          income: 0, 
          expense: 0 
        };
      }
      
      if (t.type === 'income') {
        acc[monthKey].income += t.amount;
      } else {
        acc[monthKey].expense += t.amount;
      }
      
      return acc;
    }, {} as Record<string, MonthlyGroup>);

    // 2. Convert to Array and Sort chronologically
    return (Object.values(grouped) as MonthlyGroup[])
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => {
        // Format label (e.g., "Nov 23")
        const [year, month] = item.monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const label = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        
        return {
          name: label.charAt(0).toUpperCase() + label.slice(1), // Capitalize first letter
          Ingresos: item.income,
          Gastos: item.expense
        };
      })
      // Optional: Take only last 6-12 months to avoid overcrowding
      .slice(-12); 
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
        No hay datos suficientes para el historial mensual
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, undefined]}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          <Bar 
            dataKey="Ingresos" 
            fill={colors['Ingresos'] || "#10b981"} 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
          <Bar 
            dataKey="Gastos" 
            fill={colors['Gastos'] || "#ef4444"} 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyComparisonChart;