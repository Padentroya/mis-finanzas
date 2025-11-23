import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction, CategoryColorMap } from '../types';

interface FinancialChartProps {
  transactions: Transaction[];
  colors: CategoryColorMap;
}

const FinancialChart: React.FC<FinancialChartProps> = ({ transactions, colors }) => {
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const filteredTransactions = transactions.filter(t => t.type === chartType);
  
  const dataMap = filteredTransactions.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += curr.amount;
    } else {
      acc.push({ name: curr.category, value: curr.amount });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  if (dataMap.length === 0) {
    return (
      <div className="h-full flex flex-col">
          <div className="flex justify-center mb-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setChartType('expense')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                >
                    Gastos
                </button>
                <button 
                    onClick={() => setChartType('income')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                >
                    Ingresos
                </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            No hay datos de {chartType === 'expense' ? 'gastos' : 'ingresos'} para mostrar
          </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="flex justify-center mb-4">
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setChartType('expense')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
            >
                Gastos
            </button>
            <button 
                onClick={() => setChartType('income')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
            >
                Ingresos
            </button>
        </div>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={dataMap}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
            >
                {dataMap.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={colors[entry.name] || '#94a3b8'} 
                />
                ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Monto']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialChart;