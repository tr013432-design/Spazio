import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase, Project, DailyLog } from '../lib/supabase';

const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>,
  Lock: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
  Share: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>,
  ArrowLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>,
  Camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>,
  Close: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
};

enum ProjectStage {
  BRIEFING = 'Briefing',
  CONCEPT = 'Anteprojeto',
  EXECUTIVE = 'Executivo',
  CONSTRUCTION = 'Obra',
  DELIVERY = 'Entrega'
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ title: '', client: '', value: '', deadline: '', coverUrl: '' });
  const [newLogData, setNewLogData] = useState({ content: '', imageUrl: '', logDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, daily_logs(*)')
      .order('created_at', { ascending: false });
    if (!error && data) setProjects(data as Project[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const calculateMargin = (total: number, costs: number) =>
    total > 0 ? Math.round(((total - costs) / total) * 100) : 0;

  const stageDistribution = useMemo(() => {
    return Object.values(ProjectStage).map(stage => ({
      name: stage,
      count: projects.filter(p => p.stage === stage).length
    }));
  }, [projects]);

  const handleCreateProject = async () => {
    if (!newProjectData.title || !newProjectData.client) {
      showToast('Preencha Nome do Projeto e Cliente.');
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.from('projects').insert({
      title: newProjectData.title,
      client_name: newProjectData.client,
      stage: ProjectStage.BRIEFING,
      rrt_status: 'PENDING',
      start_date: new Date().toISOString().split('T')[0],
      deadline: newProjectData.deadline || null,
      total_value: Number(newProjectData.value) || 0,
      paid_value: 0,
      costs: 0,
      cover_image_url: newProjectData.coverUrl || null,
    }).select('*, daily_logs(*)').single();
    if (!error && data) {
      setProjects(prev => [data as Project, ...prev]);
      setIsNewProjectModalOpen(false);
      setNewProjectData({ title: '', client: '', value: '', deadline: '', coverUrl: '' });
      showToast('Projeto criado com sucesso!');
    }
    setSaving(false);
  };

  const handleStageChange = async (projectId: string, newStage: ProjectStage) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, stage: newStage } : p));
    await supabase.from('projects').update({ stage: newStage }).eq('id', projectId);
    showToast(`Projeto movido para: ${newStage}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      await supabase.from('projects').delete().eq('id', projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setSelectedProjectId(null);
      showToast('Projeto excluído.');
    }
  };

  const handleIssueRRT = async (projectId: string) => {
    const rrtNumber = `RRT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await supabase.from('projects').update({ rrt_status: 'PAID', rrt_number: rrtNumber }).eq('id', projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, rrt_status: 'PAID', rrt_number: rrtNumber } : p));
    showToast('RRT Regularizada!');
  };

  const handleShareAccess = () => {
    navigator.clipboard.writeText(`https://spazio-hgwx.vercel.app/portal/${selectedProjectId}`);
    showToast('Link copiado!');
  };

  const handleAddLog = async () => {
    if (!newLogData.content || !selectedProjectId) return;
    setSaving(true);
    const { data, error } = await supabase.from('daily_logs').insert({
      project_id: selectedProjectId,
      content: newLogData.content,
      image_url: newLogData.imageUrl || null,
      log_date: newLogData.logDate,
    }).select().single();
    if (!error && data) {
      setProjects(prev => prev.map(p => {
        if (p.id !== selectedProjectId) return p;
        return { ...p, daily_logs: [data as DailyLog, ...(p.daily_logs || [])] };
      }));
      setIsLogModalOpen(false);
      setNewLogData({ content: '', imageUrl: '', logDate: new Date().toISOString().split('T')[0] });
      showToast('Registro adicionado!');
    }
    setSaving(false);
  };

  const renderInteractiveStepper = (currentStage: string, projectId: string) => {
    const stages = Object.values(ProjectStage);
    const currentIndex = stages.indexOf(currentStage as ProjectStage);
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
              <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-stone-900' : 'text-stone-300'}`}>{stage}</span>
            </button>
          );
        })}
      </div>
    );
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-stone-400">
        <Icons.Spinner />
        <p className="text-xs font-bold uppercase tracking-widest">Carregando projetos...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      {toast && (
        <div className="fixed top-6 right-6 z-[100] bg-stone-900 text-white px-6 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{toast}
        </div>
      )}

      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[60] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsNewProjectModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900"><Icons.Close /></button>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Novo Contrato</p>
              <h3 className="text-3xl font-serif font-bold text-stone-900">Cadastrar Projeto</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Nome do Projeto</label>
                <input type="text" placeholder="Ex: Reforma Cobertura Leblon" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-stone-900 transition-colors" value={newProjectData.title} onChange={e => setNewProjectData({...newProjectData, title: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Nome do Cliente</label>
                <input type="text" placeholder="Ex: Dr. Roberto Campos" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-stone-900 transition-colors" value={newProjectData.client} onChange={e => setNewProjectData({...newProjectData, client: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">URL Foto de Capa (opcional)</label>
                <input type="url" placeholder="https://..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-stone-900 transition-colors" value={newProjectData.coverUrl} onChange={e => setNewProjectData({...newProjectData, coverUrl: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Valor Total (R$)</label>
                  <input type="number" placeholder="0.00" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-stone-900 transition-colors" value={newProjectData.value} onChange={e => setNewProjectData({...newProjectData, value: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Prazo de Entrega</label>
                  <input type="date" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-stone-900 transition-colors" value={newProjectData.deadline} onChange={e => setNewProjectData({...newProjectData, deadline: e.target.value})} />
                </div>
              </div>
            </div>
            <button onClick={handleCreateProject} disabled={saving} className="w-full mt-8 bg-stone-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              {saving ? <><Icons.Spinner /> Salvando...</> : 'Criar Projeto'}
            </button>
          </div>
        </div>
      )}

      {isLogModalOpen && (
        <div className="fixed inset-0 z-[60] bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={() => setIsLogModalOpen(false)} className="absolute top-6 right-6 text-stone-400 hover:text-stone-900"><Icons.Close /></button>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Diário Técnico</p>
              <h3 className="text-2xl font-serif font-bold text-stone-900">Novo Registro</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Data</label>
                <input type="date" className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900" value={newLogData.logDate} onChange={e => setNewLogData({...newLogData, logDate: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">Registro</label>
                <textarea placeholder="Descreva o que foi feito hoje na obra..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900 h-28 resize-none" value={newLogData.content} onChange={e => setNewLogData({...newLogData, content: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wider mb-1 block">URL da Foto (opcional)</label>
                <input type="url" placeholder="https://..." className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-stone-900" value={newLogData.imageUrl} onChange={e => setNewLogData({...newLogData, imageUrl: e.target.value})} />
              </div>
              {newLogData.imageUrl && (
                <div className="w-full h-32 rounded-xl overflow-hidden bg-stone-100">
                  <img src={newLogData.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>
            <button onClick={handleAddLog} disabled={saving || !newLogData.content} className="w-full mt-8 bg-stone-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <><Icons.Spinner /> Salvando...</> : 'Adicionar Registro'}
            </button>
          </div>
        </div>
      )}

      {!selectedProjectId ? (
        <>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-serif text-stone-900">Portfólio & Execução</h2>
              <p className="text-stone-500 text-sm mt-1">Governança de canteiro e controle financeiro.</p>
            </div>
            <button onClick={() => setIsNewProjectModalOpen(true)} className="bg-stone-900 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-stone-800 transition-all active:scale-95 flex items-center gap-2">
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
                      {stageDistribution.map((_, index) => <Cell key={`cell-${index}`} fill="#1c1917" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 && (
              <div className="col-span-3 text-center py-20 text-stone-400">
                <p className="text-xs font-bold uppercase tracking-widest">Nenhum projeto ainda</p>
                <p className="text-xs mt-1">Clique em "Novo Projeto" para começar</p>
              </div>
            )}
            {projects.map(project => (
              <div key={project.id} onClick={() => setSelectedProjectId(project.id)} className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group hover:-translate-y-1">
                {project.cover_image_url ? (
                  <div className="h-40 overflow-hidden bg-stone-100">
                    <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center text-stone-300">
                    <Icons.Camera />
                  </div>
                )}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-stone-100 px-3 py-1 rounded text-stone-600">{project.stage}</span>
                    <div className={`w-2 h-2 rounded-full ${project.rrt_status === 'PAID' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></div>
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 mb-1 font-serif group-hover:text-stone-600 transition-colors">{project.title}</h4>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-8">Cliente: {project.client_name}</p>
                  <div className="border-t border-stone-100 pt-6">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Saúde do Lucro</p>
                      <p className={`text-[9px] font-bold px-2 py-0.5 rounded ${calculateMargin(project.total_value, project.costs) > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {calculateMargin(project.total_value, project.costs)}% Margem
                      </p>
                    </div>
                    <div className="relative w-full h-2 bg-stone-100 rounded-full overflow-hidden flex">
                      <div className="bg-stone-300 h-full" style={{ width: `${project.total_value > 0 ? (project.costs / project.total_value) * 100 : 0}%` }}></div>
                      <div className="bg-stone-900 h-full" style={{ width: `${project.total_value > 0 ? 100 - ((project.costs / project.total_value) * 100) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="animate-fadeIn">
          <div className="flex justify-start mb-10">
            <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold text-xs uppercase tracking-widest transition-colors">
              <Icons.ArrowLeft /> Voltar para lista
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {selectedProject?.cover_image_url && (
                <div className="h-56 rounded-3xl overflow-hidden bg-stone-100">
                  <img src={selectedProject.cover_image_url} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="bg-white p-10 rounded-[40px] border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h2 className="text-4xl font-serif font-bold text-stone-900">{selectedProject?.title}</h2>
                    <p className="text-stone-500 mt-2 font-medium">Cliente: {selectedProject?.client_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl border ${selectedProject?.rrt_status === 'PAID' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'} text-xs font-bold uppercase`}>
                      {selectedProject?.rrt_status === 'PAID' ? `RRT: ${selectedProject.rrt_number}` : 'RRT Pendente'}
                    </div>
                    <button onClick={() => selectedProject && handleDeleteProject(selectedProject.id)} className="flex items-center gap-2 text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all text-[9px] font-black uppercase tracking-widest">
                      <Icons.Trash /> Excluir Projeto
                    </button>
                  </div>
                </div>
                {selectedProject && renderInteractiveStepper(selectedProject.stage, selectedProject.id)}
                <div className="flex gap-4 mt-8 pt-8 border-t border-stone-100 relative z-10">
                  <button onClick={() => selectedProject && handleIssueRRT(selectedProject.id)} className="flex-1 py-4 border border-stone-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:bg-stone-50 transition-all">
                    {selectedProject?.rrt_status === 'PENDING' ? 'Emitir RRT Agora' : 'Baixar RRT'}
                  </button>
                  <button onClick={handleShareAccess} className="flex-1 py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                    <Icons.Share /> Copiar Link Externo
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-[12px] font-black uppercase tracking-widest text-stone-400">Diário Técnico</h4>
                  <button onClick={() => setIsLogModalOpen(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-stone-900 bg-stone-100 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition-colors">
                    <Icons.Plus /> Adicionar Registro
                  </button>
                </div>
                {(selectedProject?.daily_logs || []).length === 0 && (
                  <div className="bg-stone-50 border border-dashed border-stone-200 rounded-3xl p-10 text-center">
                    <div className="flex justify-center mb-3 text-stone-300"><Icons.Camera /></div>
                    <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Nenhum registro ainda</p>
                    <p className="text-xs text-stone-400 mt-1">Adicione fotos e anotações do progresso da obra</p>
                  </div>
                )}
                {(selectedProject?.daily_logs || [])
                  .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
                  .map(log => (
                    <div key={log.id} className="bg-white p-6 rounded-3xl border border-stone-100 flex gap-6 items-start">
                      <div className="w-24 h-24 rounded-2xl bg-stone-100 flex-shrink-0 overflow-hidden">
                        {log.image_url ? (
                          <img src={log.image_url} className="w-full h-full object-cover" alt="obra" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300"><Icons.Camera /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">
                          {new Date(log.log_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-stone-800 font-serif italic">"{log.content}"</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-stone-50 p-8 rounded-[40px] border border-stone-100 sticky top-6">
                <h4 className="text-[12px] font-black uppercase tracking-widest text-stone-400 mb-6">Raio-X Financeiro</h4>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-stone-500">Valor Total</span>
                      <span className="text-stone-900">R$ {Number(selectedProject?.total_value || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-stone-500">Recebido</span>
                      <span className="text-green-600">R$ {Number(selectedProject?.paid_value || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full" style={{ width: `${selectedProject && selectedProject.total_value > 0 ? (selectedProject.paid_value / selectedProject.total_value) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-stone-200">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Margem Líquida Real</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl font-serif font-bold text-stone-900">
                        {calculateMargin(selectedProject?.total_value || 0, selectedProject?.costs || 0)}%
                      </span>
                      <span className="text-[10px] text-stone-400">após custos</span>
                    </div>
                    <p className="text-xs text-stone-500">Custo realizado: R$ {Number(selectedProject?.costs || 0).toLocaleString('pt-BR')}</p>
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
