
import React, { useState } from 'react';
import { geminiService } from '../services/gemini';
import { Icons } from '../constants';

const AIWorkspace: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'briefing' | 'proposal' | 'norms' | 'moodboard'>('briefing');
  const [inputText, setInputText] = useState('');
  const [clientName, setClientName] = useState('');
  const [budget, setBudget] = useState('');
  const [normQuery, setNormQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [briefingResult, setBriefingResult] = useState<{ styles: string[], materials: string[], profileSummary: string } | null>(null);
  const [proposalResult, setProposalResult] = useState<string | null>(null);
  const [normResult, setNormResult] = useState<string | null>(null);
  const [moodboardUrl, setMoodboardUrl] = useState<string | null>(null);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (activeTool === 'briefing') {
        const result = await geminiService.analyzeBriefing(inputText);
        setBriefingResult(result);
      } else if (activeTool === 'proposal') {
        const result = await geminiService.generateProposal(clientName, inputText, budget ? Number(budget) : undefined);
        setProposalResult(result || '');
      } else if (activeTool === 'norms') {
        const result = await geminiService.analyzeRegulatoryDocs(inputText, normQuery);
        setNormResult(result || '');
      } else if (activeTool === 'moodboard') {
        const result = await geminiService.generateMoodboard(inputText);
        setMoodboardUrl(result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fadeIn pb-20">
      {/* Tool Navigation */}
      <div className="flex flex-wrap gap-3 px-2">
        {[
          { id: 'briefing', label: 'Briefing Inteligente' },
          { id: 'proposal', label: 'Proposta Comercial' },
          { id: 'norms', label: 'Consultor de Normas' },
          { id: 'moodboard', label: 'Moodboard Express' },
        ].map((tool) => (
          <button 
            key={tool.id}
            // Fix: Changed setActiveTab to setActiveTool as the state intended to be changed is the internal activeTool
            onClick={() => setActiveTool(tool.id as any)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTool === tool.id ? 'bg-stone-900 text-white shadow-xl scale-105' : 'bg-white text-stone-400 border border-stone-200 hover:border-stone-400'}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-2xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-stone-50 rounded-full -mr-32 -mt-32 z-0"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-stone-900 text-white p-4 rounded-3xl shadow-lg">
              {activeTool === 'briefing' && <Icons.Sparkles />}
              {activeTool === 'proposal' && <Icons.Briefcase />}
              {activeTool === 'norms' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>}
              {activeTool === 'moodboard' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-stone-800 font-serif">
                {activeTool === 'briefing' && 'Análise de Estilo & Perfil'}
                {activeTool === 'proposal' && 'Escrita Comercial Persuasiva'}
                {activeTool === 'norms' && 'Consultoria Normativa Técnico-Legal'}
                {activeTool === 'moodboard' && 'Conceito Visual Instantâneo'}
              </h3>
              <p className="text-stone-500 font-medium mt-1">
                {activeTool === 'briefing' && 'Converta notas de reunião em diretrizes criativas.'}
                {activeTool === 'proposal' && 'Gere minutas exclusivas baseadas no sonho do cliente.'}
                {activeTool === 'norms' && 'Dúvidas sobre afastamentos, TO e CA? Pergunte à IA.'}
                {activeTool === 'moodboard' && 'Crie referências visuais em segundos para validação rápida.'}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {activeTool === 'proposal' && (
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nome do Lead</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-stone-900 transition-all font-bold" placeholder="Ex: Roberto Carlos" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Investimento (R$)</label>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-stone-900 transition-all font-bold" placeholder="Ex: 150000" />
                </div>
              </div>
            )}

            {activeTool === 'norms' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Sua Pergunta Técnica</label>
                <input value={normQuery} onChange={e => setNormQuery(e.target.value)} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:border-stone-900 transition-all font-bold" placeholder="Ex: Qual o afastamento frontal para lotes de 12m de testada?" />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                {activeTool === 'norms' ? 'Cole o texto do Plano Diretor/Norma abaixo' : 'Descrição / Notas de Briefing'}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTool === 'moodboard' 
                    ? "Ex: Living contemporâneo com pé direito duplo, muita madeira clara, concreto aparente e iluminação indireta quente."
                    : "Cole aqui as notas da reunião ou o trecho do documento legal..."
                }
                className="w-full h-48 p-6 bg-stone-50 border-2 border-stone-100 rounded-[32px] focus:border-stone-900 outline-none resize-none text-stone-700 font-light leading-relaxed transition-all"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button
              onClick={handleAction}
              disabled={loading || !inputText.trim()}
              className="bg-stone-900 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-stone-800 disabled:opacity-30 flex items-center gap-4 transition-all shadow-2xl active:scale-95"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processando Inteligência...
                </>
              ) : (
                'Executar Comando'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Panes */}
      <div className="space-y-8 animate-slideUp">
        {activeTool === 'briefing' && briefingResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-xl">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-8">Diretrizes Criativas</h4>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase mb-3">Estilos Recomendados</p>
                  <div className="flex flex-wrap gap-2">
                    {briefingResult.styles.map((s, i) => (
                      <span key={i} className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-stone-300 uppercase mb-3">Materialidade</p>
                  <div className="grid grid-cols-1 gap-2">
                    {briefingResult.materials.map((m, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 text-sm font-semibold text-stone-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-stone-900 text-white p-12 rounded-[40px] shadow-2xl flex flex-col justify-center italic font-serif">
               <p className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-600 mb-8 not-italic">Resumo do Perfil</p>
               <p className="text-2xl leading-relaxed text-stone-200">"{briefingResult.profileSummary}"</p>
            </div>
          </div>
        )}

        {activeTool === 'proposal' && proposalResult && (
          <div className="bg-white p-12 rounded-[40px] border border-stone-200 shadow-2xl font-serif">
            <div className="flex justify-between items-center mb-12 border-b border-stone-100 pb-8">
              <h4 className="text-2xl font-bold italic text-stone-800">Minuta de Proposta ArchiFlow</h4>
              <button onClick={() => navigator.clipboard.writeText(proposalResult)} className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors">Copiar Documento</button>
            </div>
            <div className="text-stone-700 leading-loose whitespace-pre-wrap max-w-3xl mx-auto text-lg font-light">
              {proposalResult}
            </div>
          </div>
        )}

        {activeTool === 'norms' && normResult && (
          <div className="bg-stone-50 border-2 border-stone-900 p-12 rounded-[40px] shadow-xl">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-900 mb-8">Parecer Técnico da IA</h4>
             <div className="text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">
               {normResult}
             </div>
          </div>
        )}

        {activeTool === 'moodboard' && moodboardUrl && (
          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400 text-center">Conceito Visual Gerado</h4>
            <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white bg-white group relative">
              <img src={moodboardUrl} alt="Moodboard" className="w-full h-auto" />
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button onClick={() => window.open(moodboardUrl)} className="bg-white text-stone-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Download Alta Resolução</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIWorkspace;
