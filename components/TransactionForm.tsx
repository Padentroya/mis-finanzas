import React, { useState, useRef, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { PlusCircle, MinusCircle, Save, Camera, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { analyzeReceiptImage } from '../services/geminiService';

interface TransactionFormProps {
  onSave: (t: Transaction) => void;
  onClose: () => void;
  initialData?: Transaction | null;
  prefilledData?: Partial<Transaction> | null;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSave, onClose, initialData, prefilledData }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial data (Editing) or Prefilled data (Global Scan)
  useEffect(() => {
    if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount.toString());
        setCategory(initialData.category);
        setDescription(initialData.description);
        setDate(new Date(initialData.date).toISOString().split('T')[0]);
    } else if (prefilledData) {
        if (prefilledData.type) setType(prefilledData.type);
        if (prefilledData.amount) setAmount(prefilledData.amount.toString());
        if (prefilledData.category) setCategory(prefilledData.category);
        if (prefilledData.description) setDescription(prefilledData.description);
        if (prefilledData.date) setDate(new Date(prefilledData.date).toISOString().split('T')[0]);
    }
  }, [initialData, prefilledData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const transaction: Transaction = {
      id: initialData ? initialData.id : crypto.randomUUID(), // Keep ID if editing, new if creating
      amount: Number(amount),
      type,
      category,
      description,
      date: new Date(date).toISOString()
    };

    onSave(transaction);
    onClose();
  };

  const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const result = await analyzeReceiptImage(base64String);
        
        if (result) {
          setAmount(result.amount.toString());
          if (result.date) setDate(result.date);
          if (result.description) setDescription(result.description);
          
          if (result.category) {
            const match = EXPENSE_CATEGORIES.find(c => c.toLowerCase() === result.category?.toLowerCase()) 
                       || EXPENSE_CATEGORIES.find(c => result.category?.toLowerCase().includes(c.toLowerCase()));
            if (match) setCategory(match);
          }
          setType('expense'); 
        } else {
            alert('No se pudieron extraer datos claros de la imagen.');
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert('Error al procesar la imagen.');
    }
    e.target.value = '';
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg animate-fade-in relative overflow-hidden">
      {isScanning && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl transition-all">
          <div className="flex flex-col items-center p-6 text-center animate-bounce-small">
            <div className="relative mb-4">
               <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
               <Loader2 className="w-12 h-12 text-emerald-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Analizando Ticket</h3>
            <p className="text-slate-500 text-sm font-medium">La IA está extrayendo los datos...</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
           {initialData ? (
             <span className="flex items-center gap-2"><Save size={20} className="text-indigo-500"/> Editar Transacción</span>
           ) : (
             <div className="flex items-center gap-2">
                {type === 'expense' ? <MinusCircle className="text-red-500" /> : <PlusCircle className="text-green-500" />}
                Nueva Transacción
             </div>
           )}
        </h2>
        
        <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors border border-indigo-100 font-semibold"
        >
        {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
        <span className="hidden sm:inline">{isScanning ? 'Procesando...' : 'Escanear Ticket'}</span>
        </button>
      </div>
      
      {/* Hidden File Input for Camera */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef} 
        onChange={handleCameraCapture}
        className="hidden" 
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Ingreso
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Monto</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">€</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold text-slate-800"
              autoFocus={!initialData && !prefilledData}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Cena con amigos"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          />
        </div>

        <div className="flex gap-3 mt-6">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
                Cancelar
            </button>
            <button
                type="submit"
                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
                <Save size={20} />
                {initialData ? 'Actualizar' : 'Guardar'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;