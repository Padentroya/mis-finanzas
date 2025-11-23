import React, { useState } from 'react';
import { AppNotification } from '../types';
import { Bell, Check, Trash2, AlertTriangle, Info, AlertCircle, Sparkles, CalendarClock } from 'lucide-react';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClear: () => void;
  onRunAICheck: () => Promise<number>;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onClear,
  onRunAICheck
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRunCheck = async () => {
    setIsChecking(true);
    await onRunAICheck();
    setIsChecking(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
        case 'alert': return <AlertCircle className="text-red-500" size={20} />;
        case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
        case 'success': return <Check className="text-emerald-500" size={20} />;
        case 'bill': return <CalendarClock className="text-indigo-500" size={20} />;
        default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = (type: string) => {
     switch (type) {
        case 'alert': return 'bg-red-50';
        case 'warning': return 'bg-orange-50';
        case 'success': return 'bg-emerald-50';
        case 'bill': return 'bg-indigo-50';
        default: return 'bg-blue-50';
    }
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in origin-top-right">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-800">Notificaciones</h3>
                <div className="flex gap-2">
                    <button 
                        onClick={handleRunCheck}
                        disabled={isChecking}
                        className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                        title="Analizar con IA"
                    >
                        <Sparkles size={16} className={isChecking ? 'animate-spin' : ''} />
                    </button>
                    {unreadCount > 0 && (
                        <button 
                            onClick={onMarkAllAsRead}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Leer todas
                        </button>
                    )}
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No tienes notificaciones nuevas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map(n => (
                            <div 
                                key={n.id} 
                                className={`p-4 transition-colors relative group ${n.read ? 'bg-white opacity-70' : getBgColor(n.type)}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className={`text-sm font-semibold mb-1 ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>
                                                {n.title}
                                            </p>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                {new Date(n.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                                {!n.read && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onMarkAsRead(n.id); }}
                                        className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-full shadow-sm text-emerald-600"
                                        title="Marcar como leída"
                                    >
                                        <Check size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                    <button 
                        onClick={onClear}
                        className="text-xs text-slate-400 hover:text-red-500 flex items-center justify-center gap-1 w-full py-1"
                    >
                        <Trash2 size={12} /> Limpiar historial
                    </button>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;