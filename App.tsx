
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Transaction, FinancialSummary, BudgetMap, CategoryColorMap, GoogleSheetConfig } from './types';
import TransactionForm from './components/TransactionForm';
import FinancialChart from './components/FinancialChart';
import MonthlyComparisonChart from './components/MonthlyComparisonChart';
import CategoryTreemap from './components/CategoryTreemap';
import AIAdvisor from './components/AIAdvisor';
import TransactionFilters, { FilterState } from './components/TransactionFilters';
import BudgetManager from './components/BudgetManager';
import NotificationCenter from './components/NotificationCenter';
import SettingsView from './components/SettingsView';
import TransactionDetailModal from './components/TransactionDetailModal';
import TutorialView from './components/TutorialView';
import { useNotifications } from './hooks/useNotifications';
import { generateDemoData } from './services/demoDataGenerator';
import { parseCSV } from './services/csvParser';
import { exportToCSV } from './services/exportService';
import { DEFAULT_CATEGORY_COLORS, EXPENSE_CATEGORIES } from './constants';
import { analyzeReceiptImage } from './services/geminiService';
import { uploadToSheet, downloadFromSheet } from './services/sheetSyncService';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  History, 
  LayoutDashboard, 
  Plus, 
  Trash2,
  PieChart as PieChartIcon,
  CreditCard,
  Upload,
  Download,
  PiggyBank,
  Wand2,
  LayoutGrid,
  Settings,
  BookOpen,
  Camera,
  Loader2,
  Cloud
} from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [budgets, setBudgets] = useState<BudgetMap>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : {};
  });

  const [categoryColors, setCategoryColors] = useState<CategoryColorMap>(() => {
    const saved = localStorage.getItem('categoryColors');
    return saved ? { ...DEFAULT_CATEGORY_COLORS, ...JSON.parse(saved) } : DEFAULT_CATEGORY_COLORS;
  });

  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(() => {
    const saved = localStorage.getItem('sheetConfig');
    return saved ? JSON.parse(saved) : { scriptUrl: '' };
  });
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'analytics' | 'budgets' | 'add' | 'settings' | 'tutorial'>('dashboard');
  
  // Selection & Editing State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [prefilledTransaction, setPrefilledTransaction] = useState<Partial<Transaction> | null>(null);

  // Global Scanning State
  const [isGlobalScanning, setIsGlobalScanning] = useState(false);
  const globalFileInputRef = useRef<HTMLInputElement>(null);

  // Notification Hook
  const { notifications, markAsRead, markAllAsRead, clearNotifications, runAICheck } = useNotifications(transactions, budgets);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date-desc'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('categoryColors', JSON.stringify(categoryColors));
  }, [categoryColors]);

  useEffect(() => {
    localStorage.setItem('sheetConfig', JSON.stringify(sheetConfig));
  }, [sheetConfig]);

  const handleSaveTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
        // Update existing
        setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
        setEditingTransaction(null);
    } else {
        // Add new
        setTransactions(prev => [transaction, ...prev]);
    }
    setPrefilledTransaction(null);
    setCurrentView('dashboard');
  };

  const deleteTransaction = (id: string) => {
    if(window.confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        if (selectedTransaction?.id === id) setSelectedTransaction(null);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setPrefilledTransaction(null);
    setSelectedTransaction(null);
    setCurrentView('add'); // Reusing 'add' view for editing
  };
  
  const updateBudget = (category: string, amount: number) => {
    setBudgets(prev => ({
        ...prev,
        [category]: amount
    }));
  };

  const updateColor = (category: string, color: string) => {
    setCategoryColors(prev => ({
        ...prev,
        [category]: color
    }));
  };

  const resetColors = () => {
    if(window.confirm('¿Restaurar los colores por defecto?')) {
        setCategoryColors(DEFAULT_CATEGORY_COLORS);
    }
  };

  const loadDemoData = () => {
    if (window.confirm('¿Estás seguro? Esto borrará tus datos actuales y cargará un ejemplo de simulación.')) {
        const { transactions: demoTransactions, budgets: demoBudgets } = generateDemoData();
        setTransactions(demoTransactions);
        setBudgets(demoBudgets);
        alert('Datos de demostración cargados exitosamente.');
        setCurrentView('dashboard');
    }
  };

  // Sync Handlers
  const handleSyncUpload = async () => {
    if (!sheetConfig.scriptUrl) return;
    try {
        const success = await uploadToSheet(sheetConfig.scriptUrl, {
            transactions,
            budgets,
            colors: categoryColors
        });
        if (success) {
            const newConfig = { ...sheetConfig, lastSync: new Date().toISOString() };
            setSheetConfig(newConfig);
            alert('Datos guardados correctamente en Google Sheets.');
        } else {
            alert('Error al guardar: El script devolvió error.');
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión con Google Sheets. Verifica la URL.');
    }
  };

  const handleSyncDownload = async () => {
    if (!sheetConfig.scriptUrl) return;
    if (!window.confirm('Esto SOBRESCRIBIRÁ los datos actuales con los de la nube. ¿Continuar?')) return;
    
    try {
        const data = await downloadFromSheet(sheetConfig.scriptUrl);
        if (data) {
            if (data.transactions) setTransactions(data.transactions);
            if (data.budgets) setBudgets(data.budgets);
            if (data.colors) setCategoryColors(data.colors);
            
            const newConfig = { ...sheetConfig, lastSync: new Date().toISOString() };
            setSheetConfig(newConfig);
            alert('Datos cargados correctamente.');
        } else {
            alert('No se encontraron datos o hubo un error en el formato.');
        }
    } catch (error) {
        console.error(error);
        alert('Error al descargar datos.');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date-desc'
    });
  };

  // Global Camera Scan Logic
  const handleGlobalCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGlobalScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const result = await analyzeReceiptImage(base64String);
        
        if (result) {
            // Determine category
            let matchedCategory = 'Otros';
            if (result.category) {
                 const match = EXPENSE_CATEGORIES.find(c => c.toLowerCase() === result.category?.toLowerCase()) 
                            || EXPENSE_CATEGORIES.find(c => result.category?.toLowerCase().includes(c.toLowerCase()));
                 if (match) matchedCategory = match;
            }

            setPrefilledTransaction({
                amount: result.amount,
                date: result.date,
                description: result.description,
                category: matchedCategory,
                type: 'expense'
            });
            
            setEditingTransaction(null);
            setCurrentView('add');
        } else {
            alert('No se pudieron extraer datos claros de la imagen.');
        }
        setIsGlobalScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsGlobalScanning(false);
      alert('Error al procesar la imagen.');
    }
    e.target.value = '';
  };

  // Filter Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!t.description.toLowerCase().includes(searchLower) && 
            !t.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      if (filters.startDate) {
        const txDate = new Date(t.date).setHours(0,0,0,0);
        const startDate = new Date(filters.startDate).setHours(0,0,0,0);
        if (txDate < startDate) return false;
      }
      if (filters.endDate) {
         const txDate = new Date(t.date).setHours(0,0,0,0);
         const endDate = new Date(filters.endDate).setHours(0,0,0,0);
         if (txDate > endDate) return false;
      }
      if (filters.minAmount && t.amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && t.amount > parseFloat(filters.maxAmount)) return false;

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  }, [transactions, filters]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const parsedTransactions = parseCSV(content);
          if (parsedTransactions.length > 0) {
            setTransactions(prev => [...parsedTransactions, ...prev]);
            alert(`Se han importado ${parsedTransactions.length} transacciones correctamente.`);
          } else {
            alert('No se encontraron transacciones válidas en el archivo.');
          }
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Hubo un error al procesar el archivo.');
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const summary: FinancialSummary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      savingsRate: income > 0 ? ((income - expense) / income) * 100 : 0
    };
  }, [transactions]);

  // View Components
  const renderDashboard = () => (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mi Economía</h1>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <p>Resumen general</p>
            {sheetConfig.lastSync && (
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Cloud size={10} /> {new Date(sheetConfig.lastSync).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
             {/* 1. Tutorial Icon */}
             <button
                onClick={() => setCurrentView('tutorial')}
                className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                title="Tutorial"
             >
               <BookOpen size={24} />
             </button>

             {/* 2. Notification Center */}
             <NotificationCenter 
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClear={clearNotifications}
                onRunAICheck={runAICheck}
             />

             {/* 3. Camera Button (Large) */}
             <button 
                onClick={() => globalFileInputRef.current?.click()}
                className="p-3 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors shadow-sm"
                title="Escanear ticket"
             >
               <Camera size={28} />
             </button>
             
            <div className="bg-slate-100 p-3 rounded-full hidden md:block">
                <Wallet className="text-emerald-600" size={32} />
            </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <p className="text-slate-400 text-sm font-medium mb-1">Balance Total</p>
        <h2 className="text-4xl font-bold tracking-tight">€{summary.balance.toFixed(2)}</h2>
        <div className="mt-6 flex gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
            <div className="bg-emerald-500/20 p-1.5 rounded-full">
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Ingresos</p>
              <p className="text-sm font-semibold">€{summary.totalIncome.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl backdrop-blur-sm">
            <div className="bg-red-500/20 p-1.5 rounded-full">
              <TrendingDown size={16} className="text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase">Gastos</p>
              <p className="text-sm font-semibold">€{summary.totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <h3 className="font-semibold text-slate-700">Tasa de Ahorro</h3>
          <span className={`text-lg font-bold ${summary.savingsRate >= 20 ? 'text-emerald-500' : 'text-orange-500'}`}>
            {summary.savingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${summary.savingsRate >= 20 ? 'bg-emerald-500' : 'bg-orange-400'}`} 
            style={{ width: `${Math.min(Math.max(summary.savingsRate, 0), 100)}%` }}
          ></div>
        </div>
      </div>

      <AIAdvisor transactions={transactions} />

      <div className="flex justify-between items-center mt-8">
        <h3 className="font-bold text-slate-800 text-lg">Últimos Movimientos</h3>
        <button 
          onClick={() => setCurrentView('history')}
          className="text-sm text-emerald-600 font-medium hover:underline"
        >
          Ver todo
        </button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No hay transacciones aún.</p>
        ) : (
          transactions.slice(0, 5).map(t => (
            <div 
                key={t.id} 
                onClick={() => setSelectedTransaction(t)}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {t.type === 'income' ? <TrendingUp size={18} /> : <CreditCard size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-700">{t.category}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[150px]">{t.description}</p>
                </div>
              </div>
              <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="h-full flex flex-col pb-24 md:pb-0">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Historial</h1>
        <div className="flex gap-2">
            <button
            onClick={() => exportToCSV(filteredTransactions)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
            title="Exportar selección actual"
            >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold transition-colors"
            title="Importar CSV"
            >
            <Upload size={18} />
            <span className="hidden sm:inline">Importar</span>
            </button>
             {/* Header Camera Button for History */}
             <button 
                onClick={() => globalFileInputRef.current?.click()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
                title="Escanear ticket"
             >
               <Camera size={18} />
             </button>
        </div>
      </div>
      
      <TransactionFilters 
         filters={filters}
         onFilterChange={handleFilterChange}
         onClear={clearFilters}
         isOpen={isFilterOpen}
         onToggle={() => setIsFilterOpen(!isFilterOpen)}
      />

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredTransactions.length === 0 ? (
           <div className="text-center text-slate-400 mt-20">
             <History size={48} className="mx-auto mb-4 opacity-50" />
             <p>No se encontraron movimientos con los filtros actuales.</p>
           </div>
        ) : (
          filteredTransactions.map(t => (
            <div 
                key={t.id} 
                onClick={() => setSelectedTransaction(t)}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border-l-4 transition-all group cursor-pointer hover:shadow-md hover:scale-[1.01]" 
                style={{ borderLeftColor: categoryColors[t.category] || (t.type === 'income' ? '#10b981' : '#ef4444') }}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center bg-slate-50 w-12 h-12 rounded-lg text-xs font-bold text-slate-500">
                  <span>{new Date(t.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(t.date).toLocaleString('es-ES', { month: 'short' })}</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{t.category}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-xs">{t.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
                </p>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Análisis</h1>
          <p className="text-slate-500 text-sm">Visualiza tus finanzas</p>
        </div>
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
          <PieChartIcon size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-4">Distribución</h3>
          <FinancialChart transactions={transactions} colors={categoryColors} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-slate-700 mb-4">Mapa de Calor de Gastos</h3>
           <CategoryTreemap transactions={transactions} colors={categoryColors} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-700 mb-4">Evolución Mensual</h3>
        <MonthlyComparisonChart transactions={transactions} colors={categoryColors} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex justify-center">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />
      
      {/* Global Hidden Input for Scanning */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={globalFileInputRef} 
        onChange={handleGlobalCameraCapture}
        className="hidden" 
      />

      {/* Loading Overlay for Global Scan */}
      {isGlobalScanning && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex flex-col items-center justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center animate-bounce-small">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-800 font-bold text-lg">Analizando Ticket...</p>
              <p className="text-slate-500 text-sm">La IA está extrayendo los datos</p>
          </div>
        </div>
      )}

      <TransactionDetailModal 
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={deleteTransaction}
        onEdit={handleEditClick}
        categoryColor={selectedTransaction ? (categoryColors[selectedTransaction.category] || '#64748b') : '#64748b'}
      />

      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl bg-slate-50 md:bg-white md:shadow-2xl md:min-h-screen relative flex flex-col md:flex-row overflow-hidden">
        
        <div className="hidden md:flex flex-col w-64 border-r border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight">Finanzas Pro</span>
          </div>

          <nav className="space-y-2 flex-1">
            <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
            <button onClick={() => setCurrentView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'history' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <History size={20} /> Historial
            </button>
            
            {/* Desktop Scan Button */}
            <button onClick={() => globalFileInputRef.current?.click()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-indigo-50 hover:text-indigo-600`}>
              <Camera size={20} /> Escanear
            </button>

            <button onClick={() => setCurrentView('budgets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'budgets' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <PiggyBank size={20} /> Presupuestos
            </button>
            <button onClick={() => setCurrentView('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'analytics' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <PieChartIcon size={20} /> Análisis
            </button>
             <button onClick={() => setCurrentView('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'settings' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <Settings size={20} /> Ajustes
            </button>
            <button onClick={() => setCurrentView('tutorial')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === 'tutorial' ? 'bg-white shadow-md text-emerald-600 font-semibold' : 'text-slate-500 hover:bg-slate-200'}`}>
              <BookOpen size={20} /> Tutorial
            </button>
            <button onClick={loadDemoData} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-slate-200 hover:text-indigo-600`}>
              <Wand2 size={20} /> Datos Demo
            </button>
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-200">
             <button
               onClick={() => { setEditingTransaction(null); setPrefilledTransaction(null); setCurrentView('add'); }}
               className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
             >
               <Plus size={20} /> Nuevo
             </button>
          </div>
        </div>

        <main className="flex-1 p-6 overflow-y-auto h-screen scroll-smooth no-scrollbar">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'history' && renderHistory()}
          {currentView === 'analytics' && renderAnalytics()}
          {currentView === 'budgets' && (
             <BudgetManager 
                transactions={transactions}
                budgets={budgets}
                onUpdateBudget={updateBudget}
             />
          )}
          {currentView === 'settings' && (
             <SettingsView 
                colors={categoryColors}
                onUpdateColor={updateColor}
                onResetColors={resetColors}
                sheetConfig={sheetConfig}
                onUpdateSheetConfig={setSheetConfig}
                onSyncUpload={handleSyncUpload}
                onSyncDownload={handleSyncDownload}
             />
          )}
          {currentView === 'tutorial' && <TutorialView />}
          {currentView === 'add' && (
             <div className="pb-24 md:pb-0 max-w-md mx-auto">
               <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => { setPrefilledTransaction(null); setCurrentView('dashboard'); }}>
                 <span className="text-slate-400 text-sm">← Volver</span>
               </div>
               <TransactionForm 
                 onSave={handleSaveTransaction} 
                 onClose={() => { setPrefilledTransaction(null); setCurrentView('dashboard'); }}
                 initialData={editingTransaction}
                 prefilledData={prefilledTransaction}
               />
             </div>
          )}
        </main>

        <div className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900 text-white p-2 rounded-2xl shadow-2xl flex justify-between items-center z-40 backdrop-blur-lg bg-opacity-90 px-4">
          <button onClick={() => setCurrentView('dashboard')} className={`p-3 rounded-xl transition-all ${currentView === 'dashboard' ? 'bg-white/20 text-emerald-400' : 'text-slate-400'}`}>
            <LayoutDashboard size={24} />
          </button>
          
          <button onClick={() => setCurrentView('history')} className={`p-3 rounded-xl transition-all ${currentView === 'history' ? 'bg-white/20 text-emerald-400' : 'text-slate-400'}`}>
            <History size={24} />
          </button>

          <button 
             onClick={() => { setEditingTransaction(null); setPrefilledTransaction(null); setCurrentView('add'); }}
             className="bg-emerald-500 p-4 rounded-full -mt-10 shadow-lg shadow-emerald-500/40 text-white hover:scale-105 transition-transform"
          >
            <Plus size={28} />
          </button>

          <button onClick={() => setCurrentView('budgets')} className={`p-3 rounded-xl transition-all ${currentView === 'budgets' ? 'bg-white/20 text-emerald-400' : 'text-slate-400'}`}>
            <PiggyBank size={24} />
          </button>

          <button onClick={() => setCurrentView('settings')} className={`p-3 rounded-xl transition-all ${currentView === 'settings' ? 'bg-white/20 text-emerald-400' : 'text-slate-400'}`}>
            <Settings size={24} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
