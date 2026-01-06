import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. ÍCONES & ASSETS ---
const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>,
  Lock: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  Camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
};

// --- 2. TIPOS E DEFINIÇÕES ---
enum ProjectStage {
  BRIEFING = 'Briefing',
  CONCEPT = 'Anteprojeto',
  EXECUTIVE = 'Executivo',
  CONSTRUCTION = 'Obra',
  DELIVERY = 'Entrega'
}

interface DailyLog {
  id: string;
  date: string;
  content: string;
  imageUrl?: string;
}

interface MaterialApproval {
  id: string;
  name: string;
  category: string;
  status: 'APPROVED' | 'PENDING';
  imageUrl: string;
}

interface Project {
  id: string;
  clientId: string;
  title: string;
  clientName: string;
  stage: ProjectStage;
  rrtStatus: 'PAID' | 'PENDING';
  rrtNumber?: string;
  startDate: string;
  deadline: string;
  
  // Financeiro Completo
  financials: {
    totalValue: number;
    paidValue: number;
    costs: number; // Custos operacionais (render, plotagem, visitas)
  };

  dailyLogs: DailyLog[];
  materialApprovals: MaterialApproval[];
}

// --- 3. DADOS INICIAIS (MOCK) ---
const initialProjects: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    title: 'Apartamento Ipanema',
    clientName: 'Beatriz L.',
    stage: ProjectStage.CONSTRUCTION,
    rrtStatus: 'PAID',
    rrtNumber: 'RRT-2023-9988',
    startDate: '2023-08-15',
    deadline: '2023-12-20',
    financials: {
      totalValue: 45000,
      paidValue: 30000,
      costs: 4500
    },
    dailyLogs: [
      { id: 'l1', date: '2023-11-20', content: 'Início do assentamento do piso na sala. Material entregue conforme cronograma.', imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800' },
      { id: 'l2', date: '2023-11-21', content: 'Finalização da pintura base nos quartos. Aguardando secagem para segunda demão.', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800' }
    ],
    materialApprovals: [
      { id: 'm1', name: 'Mármore Carrara', category: 'Bancada Cozinha', status: 'APPROVED', imageUrl: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=300' },
      { id: 'm2', name: 'Porcelanato Cinza', category: 'Sala/Quartos', status: 'PENDING', imageUrl: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&w=300' }
    ]
  },
  {
    id: 'p2',
    clientId: 'c2',
    title: 'Casa de Campo - Itatiba',
    clientName: 'Ricardo M.',
    stage: ProjectStage.CONCEPT,
    rrtStatus: 'PENDING',
    startDate: '2023-10-01',
    deadline: '2024-03-15',
    financials: {
      totalValue: 120000,
      paidValue: 40000,
      costs: 12000
    },
    dailyLogs: [],
    materialApprovals: []
  }
];

// --- 4. COMPONENTE PRINCIPAL ---
const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'MANAGEMENT' | 'CLIENT'>('MANAGEMENT');
  const [toast, setToast] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Helper: Toast Notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Helper: Cálculo de Margem
  const calculateMargin = (total: number, costs: number) => {
    return Math.round(((total - costs) / total) * 100);
  };

  // Helper: Distribuição de Estágios para o Gráfico
  const stageDistribution = useMemo(() => {
    const stages = Object.values(ProjectStage);
    return stages.map(stage => ({
      name: stage,
      count: projects.filter(p => p.stage === stage).length
    }));
  }, [projects]);

  // Actions
  const handleApproveMaterial = (projectId: string, materialId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          materialApprovals: p.materialApprovals.map(m => 
            m.id === materialId ? { ...m, status: 'APPROVED' } : m
          )
        };
      }
      return p;
    }));
    showToast("Material aprovado com sucesso!");
  };

  const handleIssueRRT = () => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return { ...p, rrtStatus: 'PAID', rrtNumber: `RRT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` };
      }
      return p;
    }));
    showToast("RRT Emitida e Vinculada.");
  };

  const handleShareAccess = () => {
    navigator.clipboard.writeText(`https://archiflow.app/portal/${selectedProjectId}`);
    showToast("Link do Portal do Cliente copiado!");
  };

  // Renderiza o Stepper Visual
  const renderStepper = (currentStage: ProjectStage) => {
    const stages = Object.values(ProjectStage);
    const currentIndex = stages.indexOf(currentStage);

    return (
      <div className="flex justify-between items-center relative my-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-100 -z-10 transform -translate-y-1/2"></div>
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div key={stage} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${isCompleted ? 'bg-stone-900 border-stone-900 text-white' : isCurrent ? 'bg-white border-stone-900 scale-125 shadow-lg' : 'bg-stone-50 border-stone-200 text-stone-300'}
              `}>
                {isCompleted ? <Icons.Check /> : isCurrent ? <div className="w-2.5 h-2.5 bg-stone-900 rounded-full animate-pulse"></div> : <Icons.Lock />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-stone-900' : 'text-stone-300'}`}>{stage}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-stone-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-slideUp font-bold text-xs flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}

      {/* --- VISÃO GERAL (DASHBOARD) --- */}
      {!selectedProjectId ? (
        <>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-serif text-stone-900">Portfólio & Execução</h2>
              <p className="text-stone-500 text-sm mt-1">Governança de canteiro e controle financeiro.</p>
            </div>
            <button className="bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-2">
              <Icons.Plus /> Novo Projeto
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {/* Gráfico de Status */}
            <div className="lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-6">Pipeline Operacional</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageDistribution} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} width={100} tick={{ fill: '#78716c', fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                      {stageDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill="#1c1917" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Card RRT */}
            <div className="bg-stone-950 rounded-3xl p-8 text-stone-100 flex flex-col justify-between shadow-xl relative overflow-hidden group">
              <div className="absolute -right-5 -bottom-5 w-32 h-32 bg-stone-800 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-700"></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 mb-2">Compliance</p>
                <h4 className="text-xl font-serif">Responsabilidade Técnica</h4>
              </div>
              <div className="relative z-10 mt-6">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2 mb-4">
                  <span className="text-xs text-stone-400">Pendentes</span>
                  <span className="text-lg font-bold text-amber-500">
                    {projects.filter(p => p.rrtStatus === 'PENDING').length}
                  </span>
                </div>
                <button className="w-full py-3 bg-stone-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-800 border border-stone-800">
                  Gerenciar Docs
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Projetos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-stone-100 px-3 py-1 rounded text-stone-600">
                    {project.stage}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${project.rrtStatus === 'PAID' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                </div>
                
                <h4 className="text-xl font-bold text-stone-900 mb-1 font-serif group-hover:text-stone-600 transition-colors">{project.title}</h4>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-8">Cliente: {project.clientName}</p>
                
                {/* Micro barra de Lucratividade */}
                <div className="border-t border-stone-100 pt-6">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Saúde do Lucro</p>
                      <p className={`text-[9px] font-bold px-2 py-0.5 rounded ${calculateMargin(project.financials.totalValue, project.financials.costs) > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {calculateMargin(project.financials.totalValue, project.financials.costs)}% Margem
                      </p>
                   </div>
                   <div className="relative w-full h-2 bg-stone-100 rounded-full overflow-hidden flex">
                     <div className="bg-stone-300 h-full" style={{ width: `${(project.financials.costs / project.financials.totalValue) * 100}%` }}></div>
                     <div className="bg-stone-900 h-full" style={{ width: `${100 - ((project.financials.costs / project.financials.totalValue) * 100)}%` }}></div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* --- DETALHE DO PROJETO (MODO DUAL) --- */
        <div className="animate-fadeIn">
          {/* Header de Navegação */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors self-start">
              <Icons.ArrowLeft /> Voltar para lista
            </button>
            
            <div className="bg-stone-100 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setViewMode('MANAGEMENT')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MANAGEMENT' ? 'bg-white shadow-md text-stone-900' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Visão Arquiteto
              </button>
              <button 
                onClick={() => setViewMode('CLIENT')}
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'CLIENT' ? 'bg-stone-900 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Portal Cliente
              </button>
            </div>
          </div>

          {viewMode === 'MANAGEMENT' ? (
            /* --- VISÃO DO ARQUITETO --- */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Header Projeto */}
                <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-stone-900">{selectedProject?.title}</h2>
                      <p className="text-stone-500 mt-2 font-medium">Cliente: {selectedProject?.clientName}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl border ${selectedProject?.rrtStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'} text-xs font-bold uppercase`}>
                      {selectedProject?.rrtStatus === 'PAID' ? `RRT: ${selectedProject.rrtNumber}` : 'RRT Pendente'}
                    </div>
                  </div>
                  
                  {/* Stepper */}
                  {selectedProject && renderStepper(selectedProject.stage)}

                  {/* Ações Rápidas */}
                  <div className="flex gap-4 mt-8 pt-8 border-t border-stone-100">
                      <button onClick={handleIssueRRT} className="flex-1 py-4 border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all">
                         {selectedProject?.rrtStatus === 'PENDING' ? 'Emitir RRT Agora' : 'Baixar RRT'}
                      </button>
                      <button onClick={handleShareAccess} className="flex-1 py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                         <Icons.Share /> Link Cliente
                      </button>
                  </div>
                </div>

                {/* Diário de Obra (Gestão) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-stone-400">Diário Técnico</h4>
                    <button className="text-[10px] font-bold text-stone-900 hover:underline">+ Adicionar Registro</button>
                  </div>
                  {selectedProject?.dailyLogs.map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-3xl border border-stone-100 flex gap-6 items-start">
                        <div className="w-24 h-24 rounded-2xl bg-stone-100 flex-shrink-0 overflow-hidden">
                          {log.imageUrl ? <img src={log.imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><Icons.Camera /></div>}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-stone-800 font-serif italic">"{log.content}"</p>
                        </div>
                     </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {/* Financeiro Detalhado */}
                <div className="bg-stone-50 p-8 rounded-[40px] border border-stone-100 sticky top-6">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-stone-400 mb-6">Raio-X Financeiro</h4>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-stone-500">Valor Total</span>
                        <span className="text-stone-900">R$ {selectedProject?.financials.totalValue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-stone-500">Recebido</span>
                        <span className="text-green-600">R$ {selectedProject?.financials.paidValue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{ width: `${(selectedProject!.financials.paidValue / selectedProject!.financials.totalValue) * 100}%` }}></div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-stone-200">
                       <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Margem Líquida Real</p>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-3xl font-serif font-bold text-stone-900">{calculateMargin(selectedProject!.financials.totalValue, selectedProject!.financials.costs)}%</span>
                          <span className="text-[10px] text-stone-400">após custos</span>
                       </div>
                       <p className="text-xs text-stone-500">Custo realizado: R$ {selectedProject?.financials.costs.toLocaleString('pt-BR')}</p>
                    </div>

                    <button className="w-full py-4 border-2 border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:text-stone-900 transition-all text-stone-400">
                      Ver Extrato
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- PORTAL DO CLIENTE (EXPERIÊNCIA IMERSIVA) --- */
            <div className="bg-stone-950 text-stone-200 rounded-[48px] overflow-hidden min-h-[800px] shadow-2xl relative">
              
              {/* Hero Section */}
              <div className="p-12 md:p-20 relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800 blur-[100px] opacity-30 rounded-full pointer-events-none"></div>
                 
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500 mb-6">Portal Exclusivo do Cliente</p>
                 <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">{selectedProject?.title}</h1>
                 
                 <div className="flex flex-col md:flex-row gap-12 border-t border-white/10 pt-12">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Previsão de Entrega</p>
                      <p className="text-3xl font-serif text-white">{new Date(selectedProject?.deadline || '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Status Atual</p>
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                         <p className="text-xl font-serif text-white">{selectedProject?.stage}</p>
                      </div>
                   </div>
                 </div>
              </div>

              {/* Feed de Atualizações */}
              <div className="bg-stone-900 p-12 md:p-20">
                 <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-stone-500 mb-12 flex items-center gap-4">
                   Diário da Obra <div className="h-[1px] bg-stone-800 flex-1"></div>
                 </h3>
                 
                 <div className="space-y-16 border-l border-stone-800 pl-8 md:pl-16 relative">
                    {selectedProject?.dailyLogs.map(log => (
                       <div key={log.id} className="relative group">
                          <div className="absolute -left-[41px] md:-left-[73px] top-2 w-4 h-4 rounded-full bg-stone-950 border-2 border-stone-700 group-hover:border-white transition-colors"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-4">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                             <p className="text-xl md:text-2xl font-serif italic text-stone-300 leading-relaxed">"{log.content}"</p>
                             {log.imageUrl && (
                                <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                                   <img src={log.imageUrl} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                                </div>
                             )}
                          </div>
                       </div>
                    ))}
                    {selectedProject?.dailyLogs.length === 0 && (
                       <p className="text-stone-600 italic font-serif">A obra está começando. Em breve as primeiras atualizações aparecerão aqui.</p>
                    )}
                 </div>
              </div>

              {/* Aprovações */}
              <div className="p-12 md:p-20 bg-stone-950">
                 <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-stone-500 mb-12 flex items-center gap-4">
                   Aprovações Pendentes <div className="h-[1px] bg-stone-800 flex-1"></div>
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedProject?.materialApprovals.map(mat => (
                       <div key={mat.id} className="bg-white/5 p-8 rounded-[40px] border border-white/5 hover:bg-white/10 transition-all group backdrop-blur-sm">
                          <div className="h-48 rounded-3xl overflow-hidden mb-6 relative">
                             <img src={mat.imageUrl} className="w-full h-full object-cover" />
                             {mat.status === 'APPROVED' && (
                                <div className="absolute inset-0 bg-green-900/60 flex items-center justify-center backdrop-blur-sm">
                                   <div className="bg-white text-green-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                      <Icons.Check /> Aprovado
                                   </div>
                                </div>
                             )}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-stone-500 mb-2">{mat.category}</p>
                          <h4 className="text-2xl font-serif text-white mb-6">{mat.name}</h4>
                          
                          {mat.status === 'PENDING' ? (
                             <button 
                               onClick={() => handleApproveMaterial(selectedProject.id, mat.id)}
                               className="w-full py-4 bg-white text-stone-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform"
                             >
                                Aprovar Escolha
                             </button>
                          ) : (
                             <div className="w-full py-4 border border-white/10 text-stone-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                                Seleção Confirmada
                             </div>
                          )}
                       </div>
                    ))}
                    {selectedProject?.materialApprovals.length === 0 && (
                       <p className="text-stone-600 italic font-serif">Nenhuma pendência de material no momento.</p>
                    )}
                 </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
