
import React, { useState, useEffect } from 'react';
import { CategoryColorMap, GoogleSheetConfig } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { Palette, RotateCcw, Cloud, UploadCloud, DownloadCloud, Link as LinkIcon, Check, Save, HelpCircle, Copy, X, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { DEFAULT_CATEGORY_COLORS } from '../constants';

interface SettingsViewProps {
  colors: CategoryColorMap;
  onUpdateColor: (category: string, color: string) => void;
  onResetColors: () => void;
  sheetConfig: GoogleSheetConfig;
  onUpdateSheetConfig: (config: GoogleSheetConfig) => void;
  onSyncUpload: () => Promise<void>;
  onSyncDownload: () => Promise<void>;
}

const APPS_SCRIPT_CODE = `
function doGet(e) {
  var action = e.parameter.action;
  if (action == 'download') return downloadData();
  return ContentService.createTextOutput(JSON.stringify({status: 'ready'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.action == 'upload') return uploadData(payload.data);
    return response({status: 'error'});
  } catch (error) { return response({status: 'error', msg: error.toString()}); }
}

function uploadData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  saveToSheet(ss, 'Transactions', data.transactions, ['id', 'date', 'amount', 'type', 'category', 'description']);
  
  var budgetArray = [];
  for (var cat in data.budgets) budgetArray.push({category: cat, limit: data.budgets[cat]});
  saveToSheet(ss, 'Budgets', budgetArray, ['category', 'limit']);
  
  var colorArray = [];
  for (var cat in data.colors) colorArray.push({category: cat, color: data.colors[cat]});
  saveToSheet(ss, 'Colors', colorArray, ['category', 'color']);
  return response({status: 'success'});
}

function downloadData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var transactions = readFromSheet(ss, 'Transactions');
  
  var budgetsArr = readFromSheet(ss, 'Budgets');
  var budgets = {};
  budgetsArr.forEach(function(item) { budgets[item.category] = Number(item.limit); });
  
  var colorsArr = readFromSheet(ss, 'Colors');
  var colors = {};
  colorsArr.forEach(function(item) { colors[item.category] = item.color; });
  
  return response({
    status: 'success',
    data: { transactions: transactions, budgets: budgets, colors: colors }
  });
}

function saveToSheet(ss, sheetName, dataArray, headers) {
  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear();
  if (!dataArray || dataArray.length === 0) return;
  sheet.appendRow(headers);
  var rows = dataArray.map(function(item) {
    return headers.map(function(header) { return item[header]; });
  });
  if (rows.length > 0) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function readFromSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = row[j];
    if (obj.amount) obj.amount = Number(obj.amount);
    result.push(obj);
  }
  return result;
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
`;

const SettingsView: React.FC<SettingsViewProps> = ({ 
  colors, 
  onUpdateColor, 
  onResetColors,
  sheetConfig,
  onUpdateSheetConfig,
  onSyncUpload,
  onSyncDownload
}) => {
  const [urlInput, setUrlInput] = useState(sheetConfig.scriptUrl);
  const [isSyncing, setIsSyncing] = useState<'upload' | 'download' | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  useEffect(() => {
    setUrlInput(sheetConfig.scriptUrl);
  }, [sheetConfig.scriptUrl]);

  const handleSaveUrl = () => {
    onUpdateSheetConfig({ ...sheetConfig, scriptUrl: urlInput });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 3000);
  };

  const handleUpload = async () => {
    if (!sheetConfig.scriptUrl) return;
    setIsSyncing('upload');
    try {
        await onSyncUpload();
    } finally {
        setIsSyncing(null);
    }
  };

  const handleDownload = async () => {
    if (!sheetConfig.scriptUrl) return;
    setIsSyncing('download');
    try {
        await onSyncDownload();
    } finally {
        setIsSyncing(null);
    }
  };
  
  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const renderColorInput = (category: string) => (
    <div key={category} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
      <span className="font-medium text-slate-700">{category}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 uppercase font-mono">{colors[category] || '#000000'}</span>
        <div className="relative overflow-hidden w-8 h-8 rounded-full border border-slate-200 shadow-inner">
            <input 
                type="color" 
                value={colors[category] || '#000000'}
                onChange={(e) => onUpdateColor(category, e.target.value)}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0 border-0"
            />
        </div>
      </div>
    </div>
  );

  const isConnected = !!sheetConfig.scriptUrl;

  return (
    <div className="pb-24 md:pb-0 max-w-2xl mx-auto animate-fade-in space-y-8">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Ajustes</h1>
           <p className="text-slate-500 text-sm">Configuración y personalización</p>
        </div>
        <div className="bg-slate-100 p-2 rounded-full text-slate-600">
            <Palette size={24} />
        </div>
      </div>

      {/* Google Sheets Sync Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 relative overflow-hidden">
         <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                 <Cloud size={24} />
             </div>
             <div className="flex-1">
                 <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-800">Sincronización Google Sheets</h2>
                    {isConnected ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <Wifi size={10} /> Conectado
                        </span>
                    ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                            <WifiOff size={10} /> Sin conexión
                        </span>
                    )}
                 </div>
                 <p className="text-xs text-slate-500">Conecta tu app con una hoja de cálculo.</p>
             </div>
             <button 
               onClick={() => setShowInstructions(true)}
               className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
             >
                <HelpCircle size={14} /> Ver instrucciones
             </button>
         </div>

         <div className="space-y-4">
             <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">URL de "Aplicación web" (Copia la URL de la imagen aquí)</label>
                 
                 <div className="text-[11px] text-amber-700 mb-2 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2 leading-tight">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600"/>
                    <span>
                        <strong>¡Ojo!</strong> No pegues esta URL en Safari. <br/>
                        Esta URL sirve para conectarse a los datos. Pégala en el campo de abajo y guarda.
                    </span>
                 </div>

                 <div className="flex gap-2">
                     <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://script.google.com/macros/s/..."
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600 font-mono transition-colors ${saveFeedback ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-slate-200'}`}
                        />
                     </div>
                     <button 
                        onClick={handleSaveUrl}
                        className={`px-4 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${saveFeedback ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                     >
                        {saveFeedback ? <Check size={20} /> : <Save size={20} />}
                        {saveFeedback && <span className="text-sm">¡Guardado!</span>}
                     </button>
                 </div>
                 {isConnected && !saveFeedback && (
                    <p className="text-[10px] text-emerald-600 mt-2 flex items-center gap-1">
                        <Check size={10} /> URL configurada correctamente. Listo para sincronizar.
                    </p>
                 )}
             </div>

             {sheetConfig.scriptUrl && (
                 <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                    <button
                        onClick={handleUpload}
                        disabled={isSyncing !== null}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-indigo-50 border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                        <UploadCloud size={28} className={isSyncing === 'upload' ? 'animate-bounce' : ''} />
                        <span className="font-bold text-sm">Guardar en Nube</span>
                        <span className="text-[10px] opacity-70 text-center">Sobrescribe la hoja de cálculo</span>
                    </button>

                    <button
                        onClick={handleDownload}
                        disabled={isSyncing !== null}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                    >
                        <DownloadCloud size={28} className={isSyncing === 'download' ? 'animate-bounce' : ''} />
                        <span className="font-bold text-sm">Cargar de Nube</span>
                        <span className="text-[10px] opacity-70 text-center">Sobrescribe este dispositivo</span>
                    </button>
                 </div>
             )}
             
             {sheetConfig.lastSync && (
                 <p className="text-center text-xs text-slate-400 mt-2">
                     Última sincronización: {new Date(sheetConfig.lastSync).toLocaleString()}
                 </p>
             )}
         </div>
      </div>

      {/* Colors Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Personalizar Colores
            </h2>
            <button 
                onClick={onResetColors}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
            >
                <RotateCcw size={12} /> Restaurar defectos
            </button>
        </div>
        
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Gastos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EXPENSE_CATEGORIES.map(renderColorInput)}
                    {renderColorInput('Gastos')} 
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Ingresos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INCOME_CATEGORIES.map(renderColorInput)}
                    {renderColorInput('Ingresos')}
                </div>
            </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-fade-in">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                      <h3 className="font-bold text-lg text-slate-800">Guía de Conexión</h3>
                      <button onClick={() => setShowInstructions(false)} className="text-slate-400 hover:text-slate-600">
                          <X size={24} />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600">
                          <li>Abre una <strong>Hoja de Cálculo de Google</strong> nueva (en blanco). No hace falta crear pestañas manualmente.</li>
                          <li>Ve a <strong>Extensiones &gt; Apps Script</strong>.</li>
                          <li>Borra el código existente y pega el siguiente código:</li>
                      </ol>
                      
                      <div className="relative">
                          <pre className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs overflow-x-auto font-mono">
                              {APPS_SCRIPT_CODE}
                          </pre>
                          <button 
                              onClick={copyCodeToClipboard}
                              className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                              {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                              <span className="text-xs">{copyFeedback ? 'Copiado' : 'Copiar'}</span>
                          </button>
                      </div>

                      <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-600" start={4}>
                          <li>Pulsa <strong>Guardar</strong> (Icono de disquete).</li>
                          <li>Pulsa el botón azul <strong>Implantar (Deploy)</strong>.</li>
                          <li>Elige <strong>"Nueva implementación"</strong>. Si pulsaste "Gestionar" y sale vacío, pulsa el botón <strong>Crear implementación</strong> del centro.</li>
                          <li>En la rueda dentada (Tipo), selecciona <strong>"Aplicación Web"</strong>.</li>
                          <li>Verifica que en "Ejecutar como" esté seleccionado <strong>"Yo"</strong>.</li>
                          <li><strong>IMPORTANTE:</strong> En "Quién tiene acceso", selecciona <strong>"Cualquier usuario"</strong> (Anyone).</li>
                          <li>Pulsa Implantar. Al pedir permisos, selecciona tu cuenta.</li>
                          <li className="text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100 text-xs">
                            <strong>ALERTA DE SEGURIDAD (Normal):</strong><br/>
                            Al pulsar "Implementar", Google te pedirá permisos.<br/>
                            1. Elige tu cuenta.<br/>
                            2. Verás una pantalla de advertencia ("Google no ha verificado...").<br/>
                            3. Pulsa en <strong>"Configuración avanzada"</strong> (o "Advanced").<br/>
                            4. Pulsa en el enlace inferior que dice <strong>"Ir a [Nombre Proyecto] (no seguro)"</strong>.<br/>
                            5. Escribe "Allow" o "Permitir".
                          </li>
                          <li>
                              Copia la <strong>URL de la sección "Aplicación web"</strong> (el enlace largo que empieza por <code>https://script.google.com/...</code>).
                              <div className="mt-2 text-amber-600 text-xs bg-amber-50 p-2 rounded border border-amber-200">
                                <strong>¡OJO!</strong> No copies el "ID de implementación" de arriba. Copia la <strong>URL</strong> de abajo.
                              </div>
                          </li>
                          <li>Pega esa URL en el campo de texto de esta App y pulsa el botón negro de Guardar.</li>
                      </ol>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SettingsView;
