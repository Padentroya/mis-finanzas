import React from 'react';
import { Transaction } from '../types';
import { X, Calendar, Tag, FileText, Trash2, Edit2, TrendingUp, CreditCard } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  categoryColor: string;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ 
  transaction, 
  onClose, 
  onEdit, 
  onDelete,
  categoryColor
}) => {
  if (!transaction) return null;

  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in scale-100">
        
        {/* Header */}
        <div className="relative h-32 flex items-center justify-center" style={{ backgroundColor: categoryColor }}>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"
            >
                <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-white">
                 <div className="bg-white/20 p-3 rounded-full backdrop-blur-md mb-2 shadow-inner">
                    {transaction.type === 'income' ? <TrendingUp size={32} /> : <CreditCard size={32} />}
                 </div>
                 <span className="font-semibold opacity-90 uppercase text-xs tracking-wider">
                    {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                 </span>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 -mt-6 bg-white rounded-t-3xl relative">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">
                    €{Math.abs(transaction.amount).toFixed(2)}
                </h2>
                <p className="text-slate-500 font-medium">{transaction.description}</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm">
                        <Tag size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Categoría</p>
                        <p className="text-slate-700 font-medium">{transaction.category}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Fecha</p>
                        <p className="text-slate-700 font-medium capitalize">{formattedDate}</p>
                        <p className="text-xs text-slate-400">{formattedTime}</p>
                    </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg text-slate-400 shadow-sm">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">ID Transacción</p>
                        <p className="text-xs text-slate-500 font-mono break-all">{transaction.id}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                    onClick={() => {
                        onDelete(transaction.id);
                        onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-red-100 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={18} />
                    Eliminar
                </button>
                <button
                    onClick={() => {
                        onEdit(transaction);
                        onClose();
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors shadow-lg"
                >
                    <Edit2 size={18} />
                    Editar
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;