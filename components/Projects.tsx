import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- 1. ÍCONES & ASSETS ---
const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>,
  Lock: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  Camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
  financials: {
    totalValue: number;
    paidValue: number;
    costs: number; 
  };
  dailyLogs: DailyLog[];
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
    financials: { totalValue: 45000, paidValue: 30000, costs: 4500 },
    dailyLogs: [
      { id: 'l1', date: '2023-11-20', content: 'Início do assentamento do piso na sala.', imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800' }
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
    financials: { totalValue: 120000, paidValue: 40000, costs: 12000 },
    dailyLogs: []
  }
];

// --- 4. COMPONENTE PRINCIPAL ---
const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const calculateMargin = (total: number, costs: number) => Math.round(((total - costs) / total) * 100);

  const stageDistribution = useMemo(() => {
    const stages = Object.values(ProjectStage);
    return stages.map(stage => ({
      name: stage,
      count: projects.filter(p => p.stage === stage).length
    }));
  }, [projects]);

  // --- ACTIONS ---

  const handleStageChange = (projectId: string, newStage: ProjectStage) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, stage: newStage } : p));
    showToast(`Projeto movido para: ${newStage}`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('⚠️ Tem certeza que deseja excluir este projeto?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setSelectedProjectId(null);
      showToast('Projeto excluído com sucesso.');
    }
  };

  const handleIssueRRT = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, rrtStatus: 'PAID', rrtNumber: `RRT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` };
      }
      return p;
    }));
    showToast("RRT Regularizada! Status Atualizado.");
  };

  const handleShareAccess = () => {
    navigator.clipboard.writeText(`https://archiflow.app/portal/${selectedProjectId}`);
    showToast("Link copiado!");
  };

  // --- RENDERIZADORES AUXILIARES ---
  const renderInteractiveStepper = (currentStage: ProjectStage, projectId: string) => {
    const stages = Object.values(ProjectStage);
    const currentIndex = stages.indexOf(currentStage);
    return (
      <div className="flex justify-between items-center relative my-8 px-4">
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-stone-100 -z-10 transform -translate-y-1/2"></div>
        {stages.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <button key={stage} onClick={() => handleStageChange(projectId, stage)} className="group flex flex-col items-center gap-3 bg-white px-2 focus:outline-none">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted ? 'bg-stone-900 border-stone-900 text-white' : ''} ${isCurrent ? 'bg-white border-stone-900 scale-125 shadow-xl text-stone-900' : ''} ${index > currentIndex ? 'bg-stone-50 border-stone-200 text-stone-300' : ''}`}>
                {isCompleted && <Icons.Check />}
                {isCurrent && <div className="w-3 h-3 bg-stone-900 rounded-full animate-pulse"></div>}
                {index > currentIndex && <Icons.Lock />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-stone-900 font-bold' : 'text-stone-300'}`}>{stage}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-stone-900 text-white px-6 py-3 rounded-xl shadow-2xl animate-slideUp font-bold text-xs flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}

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

          <div className="mb-10">
            <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} onClick={() => setSelectedProjectId(project.id)} className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-stone-100 px-3 py-1 rounded text-stone-600">{project.stage}</span>
                  <div className={`w-2 h-2 rounded-full ${project.rrtStatus === 'PAID' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                </div>
                <h4 className="text-xl font-bold text-stone-900 mb-1 font-serif group-hover:text-stone-600 transition-colors">{project.title}</h4>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-8">Cliente: {project.clientName}</p>
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
        /* --- MODO DETALHE (APENAS GESTÃO) --- */
        <div className="animate-fadeIn">
          <div className="flex justify-start mb-10">
            <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors">
              <Icons.ArrowLeft /> Voltar para lista
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Header Projeto */}
              <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-stone-900">{selectedProject?.title}</h2>
                    <p className="text-stone-500 mt-2 font-medium">Cliente: {selectedProject?.clientName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                      <div className={`px-4 py-2 rounded-xl border ${selectedProject?.rrtStatus === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'} text-xs font-bold uppercase`}>
                        {selectedProject?.rrtStatus === 'PAID' ? `RRT: ${selectedProject.rrtNumber}` : 'RRT Pendente'}
                      </div>
                      <button onClick={() => selectedProject && handleDeleteProject(selectedProject.id)} className="flex items-center gap-2 text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all text-[9px] font-black uppercase tracking-widest">
                        <Icons.Trash /> Excluir Projeto
                      </button>
                  </div>
                </div>
                
                {/* Stepper Interativo */}
                {selectedProject && renderInteractiveStepper(selectedProject.stage, selectedProject.id)}

                <div className="flex gap-4 mt-8 pt-8 border-t border-stone-100 relative z-10">
                    <button onClick={() => selectedProject && handleIssueRRT(selectedProject.id)} className="flex-1 py-4 border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all">
                        {selectedProject?.rrtStatus === 'PENDING' ? 'Emitir RRT Agora' : 'Baixar RRT'}
                    </button>
                    <button onClick={handleShareAccess} className="flex-1 py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                        <Icons.Share /> Copiar Link Externo
                    </button>
                </div>
              </div>

              {/* Diário de Obra */}
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

            {/* Coluna Lateral - Financeiro */}
            <div className="space-y-8">
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
        </div>
      )}
    </div>
  );
};

export default Projects;
