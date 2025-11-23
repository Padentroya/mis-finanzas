import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, Loader2, MessageSquareQuote } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </div>
          <h2 className="text-xl font-bold">Asesor Inteligente</h2>
        </div>
        
        <p className="text-indigo-100 mb-6 text-sm leading-relaxed">
          Utiliza nuestra IA para analizar tus patrones de gasto y recibir consejos personalizados para alcanzar tu libertad financiera.
        </p>

        {!advice && (
          <button
            onClick={handleGetAdvice}
            disabled={loading || transactions.length === 0}
            className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? <Loader2 className="animate-spin" /> : <MessageSquareQuote />}
            {loading ? 'Analizando...' : 'Analizar mis Finanzas'}
          </button>
        )}

        {advice && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-fade-in text-sm text-white space-y-2 overflow-y-auto max-h-80 custom-markdown">
            <ReactMarkdown 
                components={{
                    h1: ({node, ...props}) => <h3 className="font-bold text-lg text-yellow-300 mt-2 mb-1" {...props} />,
                    h2: ({node, ...props}) => <h4 className="font-bold text-md text-yellow-300 mt-2 mb-1" {...props} />,
                    h3: ({node, ...props}) => <h5 className="font-bold text-sm text-yellow-300 mt-2 mb-1" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-white" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="text-indigo-50" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                }}
            >
                {advice}
            </ReactMarkdown>
            <button 
                onClick={() => setAdvice(null)}
                className="mt-4 text-xs font-semibold text-indigo-200 hover:text-white underline"
            >
                Cerrar análisis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;
