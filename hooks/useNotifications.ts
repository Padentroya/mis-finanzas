import { useState, useEffect, useCallback } from 'react';
import { AppNotification, Transaction, BudgetMap } from '../types';
import { analyzeForAlerts } from '../services/geminiService';

export const useNotifications = (transactions: Transaction[], budgets: BudgetMap) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    setNotifications(prev => {
      // Avoid duplicate messages on the same day
      const today = new Date().toISOString().split('T')[0];
      const exists = prev.find(n => n.title === title && n.date.startsWith(today));
      if (exists) return prev;

      return [{
        id: crypto.randomUUID(),
        title,
        message,
        type,
        date: new Date().toISOString(),
        read: false
      }, ...prev];
    });
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // 1. Check Budget Limits
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const spending: Record<string, number> = {};
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    Object.entries(budgets).forEach(([category, limit]) => {
      if (limit <= 0) return;
      const spent = spending[category] || 0;
      const percentage = (spent / limit) * 100;

      if (percentage >= 100) {
        addNotification(
          `Presupuesto Excedido: ${category}`,
          `Has gastado €${spent.toFixed(2)} de tu límite de €${limit}.`,
          'alert'
        );
      } else if (percentage >= 90) {
        addNotification(
          `Presupuesto al Límite: ${category}`,
          `Has consumido el 90% (€${spent.toFixed(2)}) de tu presupuesto.`,
          'warning'
        );
      }
    });
  }, [transactions, budgets, addNotification]);

  // 2. Check Upcoming Bills (Heuristic: Transaction same time last month)
  useEffect(() => {
    // Run this check only once per session or day ideally, but simplified here
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    // Find expenses from exactly one month ago (+/- 2 days window)
    const potentialRecurring = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (t.type !== 'expense') return false;
      
      // Check if it was roughly last month
      const isLastMonth = tDate.getMonth() === lastMonth.getMonth() && tDate.getFullYear() === lastMonth.getFullYear();
      if (!isLastMonth) return false;

      // Check if the day is approaching in current month
      return tDate.getDate() >= today.getDate() && tDate.getDate() <= threeDaysFromNow.getDate();
    });

    potentialRecurring.forEach(pastTx => {
        // Check if we already paid it this month
        const hasPaidThisMonth = transactions.some(t => 
            t.category === pastTx.category && 
            Math.abs(t.amount - pastTx.amount) < 5 && // Allow small variance
            new Date(t.date).getMonth() === today.getMonth() &&
            t.description === pastTx.description
        );

        if (!hasPaidThisMonth) {
            addNotification(
                'Posible Recibo Próximo',
                `El mes pasado pagaste "${pastTx.description}" (€${pastTx.amount}) por estas fechas. ¿Ya lo has previsto?`,
                'bill'
            );
        }
    });
  }, [transactions, addNotification]);

  // 3. Manual AI Check Trigger
  const runAICheck = async () => {
    const alerts = await analyzeForAlerts(transactions);
    alerts.forEach(alert => {
        addNotification(alert.title, alert.message, alert.type);
    });
    return alerts.length;
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    runAICheck
  };
};