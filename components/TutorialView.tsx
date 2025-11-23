
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Rocket, 
  Check, 
  Copy,
  Smartphone,
  Globe,
  Share,
  PlusSquare,
  HelpCircle,
  Key,
  Github,
  Server,
  AlertCircle,
  UploadCloud,
  ShieldAlert,
  FileJson,
  RefreshCw
} from 'lucide-react';

const TutorialView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if the current environment is a private preview
  const isPrivateEnv = currentUrl.includes('usercontent.goog') || 
                       currentUrl.includes('localhost') || 
                       currentUrl.includes('127.0.0.1') ||
                       currentUrl.startsWith('blob:');

  return (
    <div className="pb-24 md:pb-0 max-w-4xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Instalación</h1>
           <p className="text-slate-500 text-sm">Guía de despliegue</p>
        </div>
        <div className="bg-teal-100 p-2 rounded-full text-teal-600">
            <Smartphone size={24} />
        </div>
      </div>

      {/* DIAGNOSTIC PANEL */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className={`p-4 flex items-center gap-3 ${isPrivateEnv ? 'bg-slate-900 text-white' : 'bg-emerald-600 text-white'}`}>
             <div className="bg-white/20 p-2 rounded-lg">
                <Globe size={24} />
             </div>
             <div>
                <h2 className="font-bold text-lg">Estado de la App</h2>
                <p className="text-white/80 text-xs">
                    {isPrivateEnv 
                        ? 'Modo Desarrollo / Local' 
                        : '¡App en vivo y lista para instalar!'}
                </p>
             </div>
        </div>

        <div className="p-6">
            {isPrivateEnv ? (
                <div className="space-y-8">
                  
                  {/* Why I can't do it explanation */}
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-900 text-sm flex gap-3">
                    <ShieldAlert className="shrink-0 text-amber-600" size={24} />
                    <div>
                        <p className="font-bold mb-1">¿Por qué no puedo subirlo yo por ti?</p>
                        <p className="leading-relaxed opacity-90">
                            Por seguridad, no tengo acceso a tus cuentas de GitHub o Vercel. 
                            Yo genero el código, pero <strong>tú tienes las llaves</strong>. 
                            Debes descargar los archivos y subirlos manualmente para autorizar el despliegue.
                        </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-slate-800">
                      <Rocket className="text-indigo-600" />
                      Cómo publicar (El Flujo Correcto)
                    </h3>
                    <p className="text-slate-600 mb-6 text-sm">
                      Sigue este orden exacto para que funcione:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="bg-white p-4 rounded-xl border border-slate-200 text-center relative">
                            <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 hidden md:block text-slate-300">➜</div>
                            <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-600 font-bold">1</div>
                            <h4 className="font-bold text-sm">Descargar</h4>
                            <p className="text-xs text-slate-500 mt-1">Baja los archivos de este chat.</p>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 text-center relative">
                             <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 hidden md:block text-slate-300">➜</div>
                            <div className="bg-slate-900 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">2</div>
                            <h4 className="font-bold text-sm">GitHub</h4>
                            <p className="text-xs text-slate-500 mt-1">Arrastra los archivos a tu repo.</p>
                         </div>
                         <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                            <div className="bg-black w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold">3</div>
                            <h4 className="font-bold text-sm">Vercel</h4>
                            <p className="text-xs text-slate-500 mt-1">Redeploy (Re-desplegar).</p>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Checklist */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                          <Check size={16} /> Checklist de Archivos
                        </h4>
                        <p className="text-xs text-slate-500 mb-2">Asegúrate de subir estos archivos a GitHub:</p>
                        <ul className="text-xs space-y-2 text-slate-700 font-mono">
                            <li className="flex items-center gap-2">
                                <FileJson size={14} className="text-emerald-500"/> tsconfig.json <span className="text-emerald-600 bg-emerald-50 px-1 rounded ml-auto text-[10px] font-bold">VITAL</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <FileJson size={14} className="text-emerald-500"/> vite.config.ts
                            </li>
                            <li className="flex items-center gap-2">
                                <FileJson size={14} className="text-emerald-500"/> package.json
                            </li>
                            <li className="flex items-center gap-2">
                                <FileJson size={14} className="text-emerald-500"/> index.html
                            </li>
                        </ul>
                      </div>

                      {/* Solución de Problemas */}
                      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                         <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                          <AlertCircle size={16} />
                          ¿Pantalla blanca o Error 404?
                        </h4>
                        <p className="text-xs text-slate-500 mb-2">Si el despliegue falla, prueba esto:</p>
                        <ul className="text-xs space-y-3 text-slate-600">
                          <li className="flex gap-2 items-start">
                             <div className="bg-red-50 text-red-600 p-1 rounded mt-0.5"><Server size={10}/></div>
                             <span>En Vercel, ve a <strong>Settings &gt; Environment Variables</strong> y asegúrate de que <code>API_KEY</code> está puesta.</span>
                          </li>
                          <li className="flex gap-2 items-start">
                             <div className="bg-red-50 text-red-600 p-1 rounded mt-0.5"><RefreshCw size={10}/></div>
                             <span>En Vercel, ve a <strong>Deployments</strong>, pulsa los 3 puntos del último intento y selecciona <strong>Redeploy</strong> (NO Redeploy with cache).</span>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
            ) : (
                // PUBLIC ENVIRONMENT - INSTALLATION INSTRUCTIONS
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* iOS Instructions */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                             <span className="text-2xl">🍎</span> iPhone / iPad
                        </h3>
                        <ol className="space-y-4">
                            <li className="flex gap-3 items-start">
                                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm shrink-0 border border-slate-200">1</div>
                                <p className="text-sm text-slate-600 mt-1">Abre este enlace en <strong>Safari</strong>.</p>
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm shrink-0 border border-slate-200">2</div>
                                <div>
                                    <p className="text-sm text-slate-600 mt-1">Toca <strong>Compartir</strong> <Share size={14} className="inline"/> y selecciona <strong>"Añadir a pantalla de inicio"</strong>.</p>
                                </div>
                            </li>
                        </ol>
                    </div>

                    {/* Android/PC Instructions */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                                <span className="text-2xl">🤖</span> Android
                            </h3>
                            <ol className="space-y-4">
                                <li className="flex gap-3 items-start">
                                    <div className="bg-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm shrink-0 border border-slate-200">1</div>
                                    <p className="text-sm text-slate-600 mt-1">Abre el menú (3 puntos) y selecciona <strong>"Instalar aplicación"</strong>.</p>
                                </li>
                            </ol>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 text-sm mb-3">Tu Enlace Público</h3>
                            <div className="flex gap-2">
                                <input 
                                    value={currentUrl}
                                    readOnly
                                    className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:outline-none font-mono text-xs text-emerald-900 shadow-inner"
                                />
                                <button 
                                    onClick={handleCopy}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl transition-colors flex items-center justify-center shrink-0 shadow-sm"
                                    title="Copiar enlace"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TutorialView;
