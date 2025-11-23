import React from 'react';
import { Filter, X, Search, Calendar, RefreshCcw, ArrowUpDown } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

interface TransactionFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFilterChange,
  onClear,
  isOpen,
  onToggle
}) => {
  const allCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])).sort();

  // Count active filters (excluding default sort)
  const activeFiltersCount = [
    filters.search,
    filters.type !== 'all',
    filters.category !== 'all',
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount
  ].filter(Boolean).length;

  return (
    <div className="mb-4">
      <div className="flex justify-end mb-2">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
            isOpen 
              ? 'bg-slate-800 text-white' 
              : activeFiltersCount > 0 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Filter size={16} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-100 animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-semibold text-slate-700">Opciones de búsqueda</h3>
                <button onClick={onClear} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <RefreshCcw size={12} /> Limpiar filtros
                </button>
            </div>

            {/* Search and Sort Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por descripción..."
                        value={filters.search}
                        onChange={(e) => onFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                </div>
                
                <div className="relative">
                     <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                     <select
                        value={filters.sortBy}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700 appearance-none cursor-pointer"
                    >
                        <option value="date-desc">Más recientes primero</option>
                        <option value="date-asc">Más antiguos primero</option>
                        <option value="amount-desc">Mayor importe primero</option>
                        <option value="amount-asc">Menor importe primero</option>
                    </select>
                </div>
            </div>

            {/* Type and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tipo</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => onFilterChange('type', 'all')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${filters.type === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                        >
                            Todos
                        </button>
                        <button 
                            onClick={() => onFilterChange('type', 'income')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${filters.type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
                        >
                            Ingresos
                        </button>
                        <button 
                            onClick={() => onFilterChange('type', 'expense')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${filters.type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500'}`}
                        >
                            Gastos
                        </button>
                    </div>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Categoría</label>
                    <select
                        value={filters.category}
                        onChange={(e) => onFilterChange('category', e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                    >
                        <option value="all">Todas las categorías</option>
                        {allCategories.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                 </div>
            </div>

            {/* Date Range */}
            <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rango de Fechas</label>
                 <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                        />
                    </div>
                    <span className="text-slate-400 text-xs">a</span>
                    <div className="relative flex-1">
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                        />
                    </div>
                 </div>
            </div>

            {/* Amount Range */}
            <div>
                 <label className="block text-xs font-semibold text-slate-500 mb-1.5">Rango de Importe (€)</label>
                 <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Mín"
                        value={filters.minAmount}
                        onChange={(e) => onFilterChange('minAmount', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                    />
                    <span className="text-slate-400 text-xs">-</span>
                    <input
                        type="number"
                        placeholder="Máx"
                        value={filters.maxAmount}
                        onChange={(e) => onFilterChange('maxAmount', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700"
                    />
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;