
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectStage, DailyLog, MaterialApproval } from '../types';
import { Icons } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const initialProjects: Project[] = [
  {
    id: 'p1',
    clientId: 'c1',
    title: 'Apartamento Ipanema',
    stage: ProjectStage.CONSTRUCTION,
    startDate: '2023-08-15',
    deadline: '2023-12-20',
    totalValue: 15000,
    paidValue: 11250,
    progress: 75,
    rrtStatus: 'PAID',
    rrtNumber: 'RRT-2023-9988',
    dailyLogs: [
      { id: 'l1', date: '2023-11-20', content: 'Início do assentamento do piso na sala. Material entregue conforme cronograma.', imageUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800' },
      { id: 'l2', date: '2023-11-21', content: 'Finalização da pintura base nos quartos. Aguardando secagem para segunda demão.' }
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
    stage: ProjectStage.CONCEPT,
    startDate: '2023-10-01',
    deadline: '2024-03-15',
    totalValue: 45000,
    paidValue: 13500,
    progress: 30,
    rrtStatus: 'PENDING',
    dailyLogs: [],
    materialApprovals: []
  }
];

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'MANAGEMENT' | 'CLIENT'>('MANAGEMENT');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', client: '', totalValue: '', deadline: ''
  });
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const stageDistribution = useMemo(() => {
    const stages = Object.values(ProjectStage);
    return stages.map(stage => ({
      name: stage,
      count: projects.filter(p => p.stage === stage).length
    }));
  }, [projects]);

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

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: `p${Math.random().toString(36).substr(2, 9)}`,
      clientId: `c${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      stage: ProjectStage.BRIEFING,
      startDate: new Date().toISOString().split('T')[0],
      deadline: formData.deadline,
      totalValue: Number(formData.totalValue),
      paidValue: 0,
      progress: 0,
      rrtStatus: 'PENDING',
      dailyLogs: [],
      materialApprovals: []
    };
    setProjects([newProject, ...projects]);
    setIsModalOpen(false);
    setFormData({ title: '', client: '', totalValue: '', deadline: '' });
    showToast("Projeto criado e iniciado.");
  };

  const handleChargeMilestone = () => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        const increment = p.totalValue * 0.25;
        const newValue = Math.min(p.paidValue + increment, p.totalValue);
        return { ...p, paidValue: newValue };
      }
      return p;
    }));
    showToast("Cobrança enviada e saldo atualizado.");
  };

  const handleIssueRRT = () => {
    if (!selectedProjectId) return;
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        return { 
          ...p, 
          rrtStatus: 'PAID', 
          rrtNumber: `RRT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}` 
        };
      }
      return p;
    }));
    showToast("RRT Emitida e Vinculada.");
  };

  const handleAddLog = () => {
    const content = prompt("Descreva o registro técnico de hoje:");
    if (!content) return;
    
    setProjects(prev => prev.map(p => {
      if (p.id === selectedProjectId) {
        const newLog: DailyLog = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString().split('T')[0],
          content: content
        };
        return { ...p, dailyLogs: [newLog, ...p.dailyLogs] };
      }
      return p;
    }));
    showToast("Registro adicionado ao diário.");
  };

  const handleShareAccess = () => {
    navigator.clipboard.writeText(`https://archiflow.app/portal/${selectedProjectId}`);
    showToast("Link do Portal do Cliente copiado!");
  };

  const getStageColorClasses = (stage: ProjectStage) => {
    switch (stage) {
      case ProjectStage.BRIEFING: return 'bg-stone-100 text-stone-600';
      case ProjectStage.CONCEPT: return 'bg-blue-50 text-blue-600';
      case ProjectStage.TECHNICAL: return 'bg-amber-50 text-amber-600';
      case ProjectStage.CONSTRUCTION: return 'bg-purple-50 text-purple-600';
      case ProjectStage.COMPLETED: return 'bg-green-50 text-green-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl animate-slideUp font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {toast}
        </div>
      )}

      {!selectedProjectId ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
            <div>
              <h3 className="text-3xl md:text-5xl font-bold text-stone-900 tracking-tight font-serif italic">Portfólio & Execução</h3>
              <p className="text-sm md:text-base text-stone-500 mt-2 font-medium">Controle de canteiro de obras e governança documental.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-3 bg-stone-950 text-white px-8 py-5 rounded-[24px] hover:bg-stone-800 transition-all text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95"
            >
              <Icons.Plus /> Criar Novo Projeto
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white border border-stone-200 rounded-[32px] p-6 md:p-10 shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 mb-8">Fluxo Operacional Studio</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageDistribution} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} width={90} tick={{ fill: '#78716c', fontWeight: 'bold' }} />
                    <Tooltip 
                      cursor={{ fill: '#fafaf9' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={24}>
                      {stageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#1c1917" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-stone-950 rounded-[32px] p-8 text-stone-100 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-stone-800 rounded-full opacity-20 transition-transform group-hover:scale-150 duration-700"></div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-600 mb-4">Compliance</p>
                <h4 className="text-2xl font-bold font-serif leading-tight">Responsabilidade Técnica (RRT)</h4>
              </div>
              <div className="relative z-10 space-y-5 mt-10">
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                  <span className="text-xs text-stone-500 font-bold">Pendentes</span>
                  <span className="text-lg font-black text-amber-500">03</span>
                </div>
                <button className="w-full py-4 bg-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all border border-stone-800">Gerenciar Docs</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white border border-stone-200 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-2"
              >
                <div className="p-8 md:p-10">
                  <div className="flex justify-between items-start mb-8">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${getStageColorClasses(project.stage)}`}>
                      {project.stage}
                    </span>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${project.rrtStatus === 'PAID' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                       <span className="text-[10px] font-black text-stone-400 uppercase">Status RRT</span>
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-stone-900 mb-2 font-serif group-hover:text-stone-700 transition-colors leading-tight">{project.title}</h4>
                  
                  <div className="space-y-6 mt-10">
                    <div>
                      <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-stone-400 mb-3">
                        <span>Status Obra</span>
                        <span className="text-stone-950">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-stone-950 h-full transition-all duration-1000 ease-out" style={{ width: `${project.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-6">
                       <div>
                         <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Saldo Devedor</p>
                         <p className="text-lg font-black text-stone-900 tracking-tighter">R$ {(project.totalValue - project.paidValue).toLocaleString('pt-BR')}</p>
                       </div>
                       <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:bg-stone-950 group-hover:text-white transition-all">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Project Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
              <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border border-stone-100">
                <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                  <div>
                    <h4 className="text-3xl font-bold text-stone-800 font-serif">Abertura de Projeto</h4>
                    <p className="text-xs text-stone-400 mt-2 uppercase font-black tracking-[0.3em]">Gestão Executiva & Cronograma</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-3 transition-all">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <form onSubmit={handleCreateProject} className="p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Título do Projeto</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" placeholder="Ex: Apartamento Leblon - Bloco A" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nome do Cliente</label>
                    <input required value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" placeholder="Ex: João da Silva" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Investimento Total (R$)</label>
                      <input type="number" required value={formData.totalValue} onChange={e => setFormData({...formData, totalValue: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Prazo Estimado</label>
                      <input type="date" required value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-6 bg-stone-900 text-white font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl hover:bg-stone-800 transition-all shadow-2xl mt-6 active:scale-95">Iniciar Obra no Sistema</button>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 px-2">
            <button 
              onClick={() => setSelectedProjectId(null)}
              className="w-full md:w-auto flex items-center justify-center gap-3 text-stone-400 hover:text-stone-950 transition-all font-black text-[10px] uppercase tracking-[0.3em] bg-stone-100/50 px-6 py-4 rounded-2xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              Sair do Projeto
            </button>
            
            <div className="flex bg-stone-200/50 p-1.5 rounded-3xl w-full md:w-auto shadow-inner">
              <button 
                onClick={() => setViewMode('MANAGEMENT')}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MANAGEMENT' ? 'bg-white text-stone-950 shadow-xl' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Visão Arquiteto
              </button>
              <button 
                onClick={() => setViewMode('CLIENT')}
                className={`flex-1 md:flex-none px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'CLIENT' ? 'bg-white text-stone-950 shadow-xl' : 'text-stone-500 hover:text-stone-700'}`}
              >
                Portal Cliente
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-stone-200 shadow-2xl overflow-hidden min-h-[700px] relative">
            {viewMode === 'MANAGEMENT' ? (
              <div className="p-6 md:p-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                <div className="lg:col-span-2 space-y-12">
                  <header>
                    <h2 className="text-4xl md:text-6xl font-bold font-serif text-stone-950 leading-tight">{selectedProject?.title}</h2>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Construction Log</span>
                      <div className="h-[1px] flex-1 bg-stone-100"></div>
                    </div>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 bg-stone-50 rounded-[32px] border border-stone-100 group hover:border-stone-950 transition-all">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">RT Responsável</p>
                      <div className="flex items-center justify-between">
                         <span className="text-base font-bold text-stone-900">{selectedProject?.rrtNumber || 'Gerar Documento'}</span>
                         <button 
                            onClick={handleIssueRRT}
                            className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 ${selectedProject?.rrtStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 animate-pulse cursor-pointer hover:bg-amber-200'}`}
                          >
                           {selectedProject?.rrtStatus === 'PAID' ? 'Emitida' : 'Pendente'}
                         </button>
                      </div>
                    </div>
                    <div className="p-8 bg-stone-50 rounded-[32px] border border-stone-100">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Deadline Obra</p>
                      <p className="text-lg font-black text-stone-900">{new Date(selectedProject?.deadline || '').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[13px] font-black uppercase tracking-[0.2em] text-stone-950">Diário de Obra Técnico</h5>
                      <button className="text-[10px] font-black text-stone-400 hover:text-stone-900 border-b border-stone-200 pb-1">Ver todos</button>
                    </div>
                    <div className="space-y-6">
                      {selectedProject?.dailyLogs.map(log => (
                        <div key={log.id} className="p-8 bg-white border border-stone-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all border-l-8 border-stone-950">
                          <p className="text-[10px] font-black text-stone-300 mb-4 tracking-widest uppercase">{new Date(log.date).toLocaleDateString('pt-BR')}</p>
                          <p className="text-base md:text-lg text-stone-800 font-medium leading-relaxed italic">"{log.content}"</p>
                          {log.imageUrl && <img src={log.imageUrl} className="mt-4 rounded-2xl w-full h-48 object-cover border border-stone-100" />}
                        </div>
                      ))}
                      <button 
                        onClick={handleAddLog}
                        className="w-full py-8 md:py-12 border-2 border-dashed border-stone-200 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] text-stone-400 hover:border-stone-950 hover:text-stone-950 transition-all flex flex-col items-center gap-4 group"
                      >
                        <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-stone-950 group-hover:text-white transition-all">
                          <Icons.Plus />
                        </div>
                        Novo Registro (com Foto)
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:sticky lg:top-24 h-fit space-y-10 bg-stone-50 p-10 rounded-[40px] border border-stone-100">
                  <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-500">Gestão de Milestones</h5>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Investimento</p>
                          <p className="text-2xl font-bold text-stone-950 font-serif">R$ {selectedProject?.totalValue.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter">Recebido</p>
                          <p className="text-2xl font-bold text-green-600 font-serif">R$ {selectedProject?.paidValue.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="w-full h-4 bg-stone-200 rounded-full overflow-hidden shadow-inner">
                        <div className="bg-stone-950 h-full transition-all duration-1000" style={{ width: `${(selectedProject!.paidValue / selectedProject!.totalValue) * 100}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                       <button 
                          onClick={handleChargeMilestone}
                          className="w-full py-5 bg-stone-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:bg-stone-800 transition-all active:scale-95"
                        >
                          Cobrar Próxima Etapa
                        </button>
                       <button 
                          onClick={handleShareAccess}
                          className="w-full py-5 border-2 border-stone-200 text-stone-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:border-stone-950 hover:text-stone-950 transition-all active:scale-95"
                        >
                          Compartilhar Acesso Cliente
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Portal do Cliente - Killer Feature */
              <div className="p-6 md:p-20 bg-stone-950 text-stone-200 min-h-[800px] animate-fadeIn flex flex-col relative">
                {/* Fixed Side Navigation for Desktop/Tablet */}
                <nav className="hidden lg:flex fixed left-1/2 -translate-x-[640px] top-1/2 -translate-y-1/2 flex-col gap-6 z-50">
                   <button 
                    onClick={() => scrollToSection('diario-obra')}
                    className="group flex items-center gap-4 focus:outline-none"
                   >
                     <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:text-stone-900 transition-all shadow-2xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2zM14 4v4h4"></path></svg>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all text-white whitespace-nowrap bg-stone-900 px-4 py-2 rounded-xl border border-white/10">Diário da Obra</span>
                   </button>
                   <button 
                    onClick={() => scrollToSection('curadoria-decisoes')}
                    className="group flex items-center gap-4 focus:outline-none"
                   >
                     <div className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-stone-500 group-hover:bg-white group-hover:text-stone-900 transition-all shadow-2xl">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all text-white whitespace-nowrap bg-stone-900 px-4 py-2 rounded-xl border border-white/10">Curadoria</span>
                   </button>
                </nav>

                <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                  <div className="max-w-2xl">
                    <p className="text-stone-600 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Bem-vindo ao seu portal exclusivo</p>
                    <h2 className="text-5xl md:text-7xl font-bold font-serif text-white tracking-tighter leading-[0.9]">{selectedProject?.title}</h2>
                    <p className="text-stone-500 mt-8 text-xl md:text-2xl font-light font-serif italic">Acompanhe cada detalhe da transformação do seu sonho em realidade.</p>
                  </div>
                  <div className="text-left md:text-right bg-white/5 p-8 rounded-[32px] border border-white/10 w-full md:w-auto backdrop-blur-sm">
                    <p className="text-[11px] font-black text-stone-600 uppercase tracking-[0.3em] mb-2">Previsão de Entrega</p>
                    <p className="text-3xl md:text-4xl font-serif text-white">{new Date(selectedProject?.deadline || '').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    <div className="mt-4 flex items-center justify-end gap-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-stone-400">Obra em andamento</span>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
                  <div id="diario-obra" className="space-y-16 scroll-mt-20">
                    <div className="space-y-10">
                      <div className="flex items-center gap-6">
                        <h4 className="text-[12px] font-black text-stone-500 uppercase tracking-[0.4em]">Diário da Obra (Fotos & Vídeos)</h4>
                        <div className="h-[1px] flex-1 bg-stone-800"></div>
                      </div>
                      <div className="space-y-12 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-stone-800 ml-[3px]"></div>
                        {selectedProject?.dailyLogs.length ? selectedProject.dailyLogs.map(log => (
                          <div key={log.id} className="relative pl-10 group">
                             <div className="absolute top-1.5 left-0 w-2 h-2 rounded-full bg-stone-100 shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-150"></div>
                             <p className="text-[11px] font-black text-stone-700 mb-4 tracking-widest uppercase">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                             <div className="bg-stone-900/40 p-6 rounded-[32px] border border-white/5 hover:border-white/20 transition-all">
                               <p className="text-xl md:text-2xl text-stone-300 font-light leading-relaxed font-serif italic mb-6">"{log.content}"</p>
                               {log.imageUrl && (
                                 <div className="rounded-2xl overflow-hidden aspect-video border border-white/10">
                                   <img src={log.imageUrl} alt="Foto da obra" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                                 </div>
                                )}
                             </div>
                          </div>
                        )) : (
                          <div className="pl-10 text-stone-600 font-serif italic text-lg">Os primeiros registros serão publicados em breve...</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div id="curadoria-decisoes" className="space-y-16 scroll-mt-20">
                    <div className="space-y-10">
                      <div className="flex items-center gap-6">
                        <h4 className="text-[12px] font-black text-stone-500 uppercase tracking-[0.4em]">Curadoria & Decisões</h4>
                        <div className="h-[1px] flex-1 bg-stone-800"></div>
                      </div>
                      <div className="grid grid-cols-1 gap-10">
                        {selectedProject?.materialApprovals.length ? selectedProject.materialApprovals.map(mat => (
                          <div key={mat.id} className="flex flex-col md:flex-row gap-8 p-8 md:p-10 bg-white/5 rounded-[48px] border border-white/5 items-center hover:bg-white/10 transition-all group overflow-hidden backdrop-blur-sm">
                             <div className="relative w-full md:w-48 h-48 rounded-[32px] overflow-hidden shadow-2xl">
                                <img src={mat.imageUrl} alt={mat.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-stone-950/20"></div>
                             </div>
                             <div className="flex-1 text-center md:text-left">
                               <p className="text-[10px] font-black text-stone-600 uppercase mb-2 tracking-widest">{mat.category}</p>
                               <h5 className="text-3xl font-bold text-white mb-8 font-serif leading-tight">{mat.name}</h5>
                               <div className="flex gap-4">
                                 {mat.status === 'PENDING' ? (
                                   <>
                                     <button 
                                        onClick={() => handleApproveMaterial(selectedProject.id, mat.id)}
                                        className="flex-1 py-4 bg-white text-stone-950 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95"
                                      >
                                        Aprovar Escolha
                                      </button>
                                     <button className="flex-1 py-4 border border-white/10 text-stone-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">Dúvidas</button>
                                   </>
                                 ) : (
                                   <div className="w-full bg-green-500/10 py-5 rounded-3xl flex items-center justify-center gap-4 border border-green-500/20 animate-fadeIn">
                                     <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                                     </div>
                                     <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.2em]">Material Aprovado por você</span>
                                   </div>
                                 )}
                               </div>
                             </div>
                          </div>
                        )) : (
                          <div className="p-10 bg-white/5 rounded-[40px] text-center italic text-stone-600 font-serif">
                             A curadoria de materiais será carregada em breve...
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-10 bg-stone-900/60 rounded-[48px] border border-white/5 space-y-6">
                       <h4 className="text-[12px] font-black text-stone-500 uppercase tracking-[0.4em]">Financeiro & Próximas Etapas</h4>
                       <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[10px] text-stone-600 uppercase font-black mb-1">Status de Investimento</p>
                            <p className="text-2xl text-white font-serif">Milestone atual pago</p>
                         </div>
                         <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-400 transition-all">Ver Contrato</button>
                       </div>
                       <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden">
                          <div className="bg-white h-full" style={{ width: `${selectedProject?.progress}%` }}></div>
                       </div>
                    </div>
                  </div>
                </div>

                <footer className="mt-auto pt-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em]">Experience the Unseen.</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] font-serif italic">ARCHIFLOW STUDIO EXCLUSIVE CLIENT PORTAL</p>
                </footer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
