import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { Icons } from '../constants';

const AIWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'briefing' | 'proposal' | 'regulations' | 'moodboard'>('briefing');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      
      switch (activeTab) {
        case 'briefing':
          response = await geminiService.analyzeBriefing(inputText);
          break;
        case 'proposal':
          response = await geminiService.generateProposal("Cliente Potencial", inputText); 
          break;
        case 'regulations':
          response = await geminiService.analyzeRegulatoryDocs(inputText, "Resumo das principais restrições e diretrizes.");
          break;
        case 'moodboard':
          response = "Funcionalidade de imagem em breve."; 
          break;
      }
      
      setResult(response);
    } catch (err) {
      console.error("Erro na IA:", err);
      setError("Não foi possível conectar com a IA. Verifique sua chave API.");
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (loading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold text-sm tracking-widest uppercase animate-pulse">Processando Inteligência...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
          {error}
        </div>
       );
    }

    if (!result) return null;

    return (
      <div className="mt-8 p-8 bg-white border border-stone-100 rounded-3xl shadow-lg animate-slideUp">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Icons.Sparkles /> Resultado da Análise
        </h3>
        <div className="prose prose-stone max-w-none text-stone-600 leading-relaxed whitespace-pre-wrap font-serif">
          {typeof result === 'object' ? JSON.stringify(result, null, 2) : result}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold text-stone-900 font-serif">AI Workspace</h2>
        <p className="text-stone-500">Suíte de ferramentas cognitivas para arquitetura.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { id: 'briefing', label: 'Briefing Inteligente' },
          { id: 'proposal', label: 'Proposta Comercial' },
          { id: 'regulations', label: 'Consultor de Normas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setResult(null); setError(null); }}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-stone-900 text-white shadow-lg scale-105' 
                : 'bg-white text-stone-400 hover:bg-stone-50 border border-transparent hover:border-stone-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[40px] shadow-sm border border-stone-100 p-2">
        <div className="p-8 md:p-12">
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-48 p-6 bg-stone-50 rounded-2xl border-2 border-stone-100 outline-none focus:border-stone-900 font-medium"
              placeholder="Cole aqui as notas da reunião ou o trecho do documento legal..."
            />
            <div className="flex justify-end pt-4">
              <button
                onClick={handleExecute}
                disabled={loading || !inputText.trim()}
                className="px-8 py-4 bg-stone-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-stone-800"
              >
                {loading ? 'Processando...' : 'Executar Comando'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {renderResult()}
    </div>
  );
};

export default AIWorkspace;
