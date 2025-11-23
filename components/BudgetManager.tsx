
import React, { useState, useMemo } from 'react';
import { Transaction, BudgetMap } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { Edit2, Check, AlertCircle, PiggyBank } from 'lucide-react';

interface BudgetManagerProps {
  transactions: Transaction[];
  budgets: BudgetMap;
  onUpdateBudget: (category: string, amount: number) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ transactions, budgets, onUpdateBudget }) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState('');

  // Calculate spending for the CURRENT month only
  const currentMonthSpending = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spending: Record<string, number> = {};

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (
        t.type === 'expense' &&
        tDate.getMonth() === currentMonth &&
        tDate.getFullYear() === currentYear
      ) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    return spending;
  }, [transactions]);

  const handleEditClick = (category: string, currentBudget: number) => {
    setEditingCategory(category);
    setTempAmount(currentBudget ? currentBudget.toString() : '');
  };

  const handleSave = (category: string) => {
    const amount = parseFloat(tempAmount);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateBudget(category, amount);
    }
    setEditingCategory(null);
  };

  const currentMonthName = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="pb-24 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Presupuestos</h1>
           <p className="text-slate-500 text-sm capitalize">{currentMonthName}</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
            <PiggyBank size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {EXPENSE_CATEGORIES.map(category => {
          const spent = currentMonthSpending[category] || 0;
          const budget = budgets[category] || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const isOverBudget = spent > budget && budget > 0;
          
          // Determine color based on percentage
          let progressBarColor = 'bg-emerald-500';
          let textColor = 'text-slate-600';
          
          if (percentage > 100) {
            progressBarColor = 'bg-red-600';
            textColor = 'text-red-700';
          } else if (percentage > 85) {
            progressBarColor = 'bg-orange-400';
            textColor = 'text-orange-600';
          }

          return (
            <div 
                key={category} 
                className={`p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                    isOverBudget ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold ${isOverBudget ? 'text-red-800' : 'text-slate-700'}`}>
                        {category}
                    </h3>
                    {isOverBudget && (
                        <AlertCircle size={18} className="text-red-600 animate-pulse" fill="currentColor" stroke="white" />
                    )}
                  </div>
                  
                  <div className="text-sm mt-1">
                    <span className={`font-semibold ${isOverBudget ? 'text-red-700' : 'text-slate-900'}`}>
                        €{spent.toFixed(2)}
                    </span>
                    <span className="text-slate-400 mx-1">de</span>
                    {editingCategory === category ? (
                      <div className="inline-flex items-center gap-2">
                         <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">€</span>
                            <input 
                                type="number" 
                                value={tempAmount}
                                onChange={(e) => setTempAmount(e.target.value)}
                                className="w-full pl-5 pr-2 py-1 bg-slate-50 border border-emerald-500 rounded text-sm focus:outline-none"
                                autoFocus
                            />
                         </div>
                         <button 
                            onClick={() => handleSave(category)}
                            className="bg-emerald-500 text-white p-1 rounded hover:bg-emerald-600"
                         >
                            <Check size={14} />
                         </button>
                      </div>
                    ) : (
                      <span className="font-semibold text-slate-500">
                         €{budget > 0 ? budget.toFixed(2) : '---'}
                      </span>
                    )}
                  </div>
                </div>
                
                {editingCategory !== category && (
                    <button 
                        onClick={() => handleEditClick(category, budget)}
                        className="text-slate-300 hover:text-emerald-600 transition-colors p-1"
                    >
                        <Edit2 size={16} />
                    </button>
                )}
              </div>

              {/* Progress Bar Container */}
              <div className="relative pt-2">
                 {budget > 0 ? (
                    <>
                        <div className="flex justify-between text-xs mb-1 font-semibold">
                            <span className={textColor}>{percentage.toFixed(0)}%</span>
                            <span className={isOverBudget ? 'text-red-600 font-bold' : 'text-slate-400'}>
                                {isOverBudget 
                                    ? `Excedido: €${(spent - budget).toFixed(2)}` 
                                    : `Restante: €${(budget - spent).toFixed(2)}`
                                }
                            </span>
                        </div>
                        <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${progressBarColor}`} 
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                        </div>
                    </>
                 ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg mt-1">
                        <AlertCircle size={14} />
                        Define un presupuesto para ver tu progreso.
                    </div>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;
