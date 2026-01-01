import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus, Task } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/gemini';

const initialLeads: Lead[] = [
  { 
    id: '1', 
    name: 'Marcos Vinicius', 
    email: 'marcos@email.com', 
    phone: '(11) 98888-7777', 
    source: 'Instagram', 
    status: LeadStatus.PROSPECTION, 
    createdAt: '2023-10-25', 
    notes: 'Interesse em reforma de cobertura no Itaim. Busca estilo industrial chic, quer integrar a área gourmet com a sala.',
    budget: 85000,
    address: 'Av. Paulista, 1000 - SP',
    taxId: '123.456.789-00',
    tasks: [
      { id: 't1', description: 'Enviar portfólio de coberturas luxo', completed: false },
      { id: 't2', description: 'Agendar visita técnica para medição', completed: false }
    ]
  },
  { 
    id: '2', 
    name: 'Clara Nunes', 
    email: 'clara@email.com', 
    phone: '(11) 97777-6666', 
    source: 'Indicação', 
    status: LeadStatus.BRIEFING, 
    createdAt: '2023-10-20', 
    notes: 'Consultoria de design de interiores para living. Gosta de minimalismo e materiais naturais como palha e linho.',
    budget: 15000,
    tasks: [
      { id: 't3', description: 'Finalizar moodboard do briefing', completed: true }
    ]
  },
  { 
    id: '3', 
    name: 'Pedro Alvares', 
    email: 'pedro@email.com', 
    phone: '(11) 96666-5555', 
    source: 'Google Ads', 
    status: LeadStatus.TECHNICAL_VISIT, 
    createdAt: '2023-10-15', 
    notes: 'Projeto completo residencial em Alphaville. Terreno em declive desafiador.',
    tasks: []
  },
];

const CRM: React.FC = () => {
  // --- MODIFICAÇÃO JARVIS: INÍCIO ---
  // Carrega leads salvos no navegador. Se não houver, usa a lista inicial de exemplo.
  // IMPORTANTE: Adicionada verificação para corrigir leads antigos sem 'tasks'
  const [leads, setLeads] = useState<Lead[]>(() => {
    // Verificação de segurança para ambiente Server-Side (Next.js/Vercel)
    if (typeof window === 'undefined') return initialLeads;

    const savedLeads = localStorage.getItem('archiflow_leads');
    if (savedLeads) {
      try {
        const parsedLeads = JSON.parse(savedLeads);
        
        // Mapeia os leads recuperados garantindo que a estrutura esteja atualizada
        return parsedLeads.map((lead: any) => ({
          ...lead,
          tasks: lead.tasks || [], // Se tasks for undefined, define como array vazio
          budget: lead.budget || 0 // Garante que budget exista
        }));
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
        return initialLeads;
      }
    }
    return initialLeads;
  });

  // Salva automaticamente no navegador sempre que você mexer em um lead
  useEffect(() => {
    localStorage.setItem('archiflow_leads', JSON.stringify(leads));
  }, [leads]);
  // --- MODIFICAÇÃO JARVIS: FIM ---

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Lead>>({});
   
  const [aiMessage, setAiMessage] = useState<{ [key: string]: string }>({});
  const [aiProposal, setAiProposal] = useState<{ [key: string]: string }>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);
  const [loadingProposal, setLoadingProposal] = useState<string | null>(null);
   
  const [newTaskText, setNewTaskText] = useState<{ [key: string]: string }>({});
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | null>(null);
   
  const [taskToDelete, setTaskToDelete] = useState<{ leadId: string, taskId: string } | null>(null);
   
  const taskInputRef = useRef<HTMLInputElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', taxId: '', notes: '', source: 'Instagram', budget: ''
  });

  const statuses = Object.values(LeadStatus);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  useEffect(() => {
    if (selectedLeadId && taskInputRef.current && !isEditingLead) {
      taskInputRef.current.focus();
    }
  }, [selectedLeadId, isEditingLead]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData('leadId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    if (dragOverStatus !== status) {
      setDragOverStatus(status);
    }
  };

  const onDrop = (e: React.DragEvent, newStatus: LeadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId') || draggedLeadId;
    
    if (id) {
      setLeads(prevLeads => 
        prevLeads.map(lead => 
          lead.id === id ? { ...lead, status: newStatus } : lead
        )
      );
    }
    
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const onDragEnd = () => {
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const handleGenerateFollowUp = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setLoadingAi(lead.id);
    try {
      const msg = await geminiService.generateFollowUpMessage(lead.name, lead.status);
      setAiMessage({ ...aiMessage, [lead.id]: msg || 'Não foi possível gerar a mensagem.' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(null);
    }
  };

  const handleGenerateProposal = async (lead: Lead) => {
    setLoadingProposal(lead.id);
    try {
      const proposal = await geminiService.generateProposal(lead.name, lead.notes, lead.budget);
      setAiProposal({ ...aiProposal, [lead.id]: proposal || 'Erro ao gerar proposta.' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProposal(null);
    }
  };

  const toggleTask = (leadId: string, taskId: string) => {
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          tasks: lead.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return lead;
    }));
  };

  const confirmDeleteTask = (leadId: string, taskId: string) => {
    setTaskToDelete({ leadId, taskId });
  };

  const executeDeleteTask = () => {
    if (!taskToDelete) return;
    const { leadId, taskId } = taskToDelete;
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          tasks: lead.tasks.filter(task => task.id !== taskId)
        };
      }
      return lead;
    }));
    setTaskToDelete(null);
  };

  const addTask = (leadId: string) => {
    const text = newTaskText[leadId];
    if (!text?.trim()) return;
    setLeads(leads.map(lead => {
      if (lead.id === leadId) {
        const newTask: Task = { id: Math.random().toString(36).substr(2, 9), description: text, completed: false };
        return { ...lead, tasks: [...lead.tasks, newTask] };
      }
      return lead;
    }));
    setNewTaskText({ ...newTaskText, [leadId]: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      budget: formData.budget ? Number(formData.budget) : undefined,
      status: LeadStatus.PROSPECTION,
      createdAt: new Date().toISOString().split('T')[0],
      tasks: []
    } as Lead;
    setLeads([newLead, ...leads]);
    setFormData({
      name: '', email: '', phone: '', address: '', taxId: '', notes: '', source: 'Instagram', budget: ''
    });
    setIsModalOpen(false);
  };

  const handleStartEdit = () => {
    if (selectedLead) {
      setEditFormData({ ...selectedLead });
      setIsEditingLead(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedLead && editFormData) {
      setLeads(leads.map(lead => 
        lead.id === selectedLeadId ? { ...lead, ...editFormData } : lead
      ));
      setIsEditingLead(false);
    }
  };

  const getStatusBorderColor = (status: LeadStatus) => {
    switch (status) {
      case LeadStatus.PROSPECTION: return 'border-stone-200';
      case LeadStatus.TECHNICAL_VISIT: return 'border-blue-400';
      case LeadStatus.BRIEFING: return 'border-amber-400';
      case LeadStatus.CONCEPT: return 'border-purple-400';
      case LeadStatus.SIGNED: return 'border-green-500';
      default: return 'border-stone-200';
    }
  };

  const renderEditableField = (label: string, field: keyof Lead, type: string = "text", icon?: React.ReactNode) => {
    const value = editFormData[field] as string | number | undefined;
    
    if (isEditingLead) {
      return (
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 focus-within:border-stone-900 transition-all">
          <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1.5">
            {icon} {label}
          </p>
          <input
            type={type}
            value={value || ''}
            onChange={(e) => setEditFormData({ ...editFormData, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
            className="w-full text-xs font-semibold text-stone-800 bg-transparent outline-none"
            placeholder={`Digite o ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    return (
      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1.5">
          {icon} {label}
        </p>
        <p className="text-xs font-semibold text-stone-800 truncate">
          {field === 'budget' && value ? `R$ ${Number(value).toLocaleString('pt-BR')}` : (value || '—')}
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-2xl font-bold text-stone-800">Pipeline Comercial</h3>
          <p className="text-sm text-stone-500">Fluxo boutique focado em alta conversão.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-all text-sm font-bold shadow-lg active:scale-95"
        >
          <Icons.Plus /> Novo Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 flex gap-6 custom-scrollbar min-h-[600px]">
        {statuses.map(status => (
          <div 
            key={status} 
            className={`flex-shrink-0 w-80 flex flex-col transition-all duration-500 ${dragOverStatus === status ? 'scale-[1.03]' : ''}`}
            onDragOver={(e) => onDragOver(e, status)}
            onDrop={(e) => onDrop(e, status)}
            onDragLeave={() => setDragOverStatus(null)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full transition-all duration-300 ${dragOverStatus === status ? 'bg-stone-900 scale-150 shadow-[0_0_12px_rgba(28,25,23,0.4)]' : 'bg-stone-300'}`}></span>
                {status}
              </h4>
              <span className="bg-stone-200/60 text-stone-600 text-[9px] font-black px-2.5 py-1 rounded-full">
                {leads.filter(l => l.status === status).length}
              </span>
            </div>
            
            <div className={`flex-1 rounded-2xl p-3 space-y-3 border transition-all duration-500 ${dragOverStatus === status ? 'bg-stone-200/60 border-stone-400 shadow-inner' : 'bg-stone-100/40 border-stone-200/50'}`}>
              {leads.filter(l => l.status === status).map(lead => (
                <div 
                  key={lead.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, lead.id)}
                  onDragEnd={onDragEnd}
                  onClick={() => { setSelectedLeadId(lead.id); setIsEditingLead(false); }}
                  className={`bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-2xl hover:border-stone-900/20 transition-all duration-300 cursor-grab active:cursor-grabbing group animate-slideUp border-l-4 ${getStatusBorderColor(lead.status)} 
                    ${draggedLeadId === lead.id ? 'opacity-20 scale-90 rotate-3 border-dashed border-stone-400 shadow-2xl blur-[1px]' : 'hover:-translate-y-1'}`}
                >
                  <div className="p-5 flex flex-col pointer-events-none">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-stone-800 text-[15px] leading-tight group-hover:text-stone-600 transition-colors">
                        {lead.name}
                      </h5>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest bg-stone-50 px-2.5 py-1 rounded border border-stone-100">
                        {lead.source}
                      </span>
                      {lead.budget && (
                        <span className="text-[11px] font-black text-stone-900 ml-auto tracking-tight">
                          R$ {lead.budget.toLocaleString('pt-BR')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-4 opacity-70">
                      <div className="flex items-center gap-2 text-[10px] text-stone-500">
                        <Icons.Mail />
                        <span className="truncate max-w-[140px]">{lead.email}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-stone-50 mt-auto">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="bg-stone-900 h-full transition-all duration-700" 
                            style={{ width: `${lead.tasks.length > 0 ? (lead.tasks.filter(t => t.completed).length / lead.tasks.length) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-stone-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md">
                          {lead.name.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {leads.filter(l => l.status === status).length === 0 && (
                <div className="h-28 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center transition-all group hover:bg-white/50">
                  <p className="text-[10px] text-stone-300 font-black uppercase tracking-widest group-hover:text-stone-400">Arraste um lead</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Slide-over */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md transition-all duration-500" onClick={() => { setSelectedLeadId(null); setIsEditingLead(false); }}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slideRight flex flex-col">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div className="flex items-center gap-5 flex-1">
                <div className="w-16 h-16 rounded-3xl bg-stone-900 text-white flex items-center justify-center font-bold text-2xl shadow-2xl border-4 border-stone-100">
                   {selectedLead.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingLead ? (
                    <input 
                      className="text-3xl font-bold text-stone-800 leading-tight w-full bg-white border-2 border-stone-200 rounded-2xl px-4 py-2 focus:ring-4 focus:ring-stone-900/5 outline-none"
                      value={editFormData.name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  ) : (
                    <h4 className="text-3xl font-bold text-stone-800 leading-tight truncate font-serif">{selectedLead.name}</h4>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-stone-900 px-3 py-1 rounded-full">{selectedLead.status}</span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Membro desde {new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelectedLeadId(null); setIsEditingLead(false); }} className="p-4 hover:bg-stone-200 rounded-2xl transition-all ml-6 text-stone-400 hover:text-stone-900">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                {renderEditableField("Email do Cliente", "email", "email", <Icons.Mail />)}
                {renderEditableField("Contato Direto", "phone", "text", <Icons.Phone />)}
              </div>

              <div className="grid grid-cols-1">
                {renderEditableField("Localização do Projeto", "address", "text", <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>)}
              </div>

              <div className="grid grid-cols-2 gap-8">
                {renderEditableField("Doc Identificação", "taxId", "text")}
                {renderEditableField("Investimento Planejado", "budget", "number")}
              </div>

              {!isEditingLead && (
                <>
                  {/* Action Center - Persuasive Tools */}
                  <div className="space-y-6 pt-8 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[12px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-3">
                        <Icons.Sparkles /> Ações Comerciais Inteligentes
                      </h5>
                    </div>
                     
                    <div className="grid grid-cols-2 gap-5">
                      {/* Follow-up Button */}
                      <button 
                        disabled={!!loadingAi}
                        onClick={(e) => handleGenerateFollowUp(e, selectedLead)}
                        className="p-6 bg-stone-50 border-2 border-transparent rounded-3xl text-left hover:border-stone-900 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden"
                      >
                        <div className="bg-stone-200 p-3 w-fit rounded-2xl mb-4 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm">
                          <Icons.Mail />
                        </div>
                        <p className="text-sm font-black text-stone-800 uppercase tracking-tight">WhatsApp Persuasivo</p>
                        <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">Mensagem elegante focada em fechar a próxima visita.</p>
                      </button>

                      {/* Proposal Button */}
                      <button 
                        disabled={!!loadingProposal}
                        onClick={() => handleGenerateProposal(selectedLead)}
                        className="p-6 bg-stone-50 border-2 border-transparent rounded-3xl text-left hover:border-stone-900 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden"
                      >
                        <div className="bg-stone-200 p-3 w-fit rounded-2xl mb-4 group-hover:bg-stone-900 group-hover:text-white transition-all shadow-sm">
                          <Icons.Briefcase />
                        </div>
                        <p className="text-sm font-black text-stone-800 uppercase tracking-tight">Gerar Proposta Comercial</p>
                        <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">Criação de minuta persuasiva com base no briefing.</p>
                      </button>
                    </div>

                    {/* AI Processors */}
                    {(loadingAi === selectedLead.id || loadingProposal === selectedLead.id) && (
                      <div className="bg-stone-50 p-12 rounded-3xl flex flex-col items-center justify-center space-y-4 border border-stone-100">
                        <div className="w-10 h-10 border-4 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[11px] text-stone-500 font-black uppercase tracking-[0.3em] animate-pulse">Redigindo estratégia...</span>
                      </div>
                    )}

                    {!loadingAi && !loadingProposal && (
                      <div className="space-y-6">
                        {aiMessage[selectedLead.id] && (
                          <div className="bg-stone-900 text-stone-100 p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn relative">
                             <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Sugestão de Abordagem</span>
                               <button onClick={() => navigator.clipboard.writeText(aiMessage[selectedLead.id])} className="text-[11px] font-black text-stone-400 hover:text-white transition-all border-b border-stone-700">Copiar</button>
                             </div>
                             <p className="text-base italic leading-relaxed font-light text-stone-200 font-serif">"{aiMessage[selectedLead.id]}"</p>
                          </div>
                        )}
                        {aiProposal[selectedLead.id] && (
                          <div className="bg-white border-2 border-stone-900 p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn font-serif">
                             <div className="flex justify-between items-center border-b border-stone-100 pb-4">
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Documento de Proposta</span>
                               <button onClick={() => navigator.clipboard.writeText(aiProposal[selectedLead.id])} className="text-[11px] font-black text-stone-500 hover:text-stone-900 transition-all">Copiar Estrutura</button>
                             </div>
                             <div className="text-sm text-stone-700 leading-loose whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar pr-4 italic">
                               {aiProposal[selectedLead.id]}
                             </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-5 pt-8 border-t border-stone-100">
                    <h5 className="text-[12px] font-black uppercase tracking-widest text-stone-400 flex items-center justify-between">
                      <span>Plano de Acompanhamento</span>
                      <span className="text-[10px] bg-stone-100 px-3 py-1.5 rounded-full text-stone-500 font-black">
                        {selectedLead.tasks.filter(t => t.completed).length} / {selectedLead.tasks.length}
                      </span>
                    </h5>
                     
                    <div className="flex gap-3 bg-stone-50 p-3 rounded-2xl border-2 border-stone-100 focus-within:border-stone-900 transition-all">
                      <input 
                        ref={taskInputRef}
                        type="text" 
                        value={newTaskText[selectedLead.id] || ''}
                        onChange={(e) => setNewTaskText({ ...newTaskText, [selectedLead.id]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && addTask(selectedLead.id)}
                        placeholder="Adicionar próximo passo comercial..."
                        className="flex-1 text-sm bg-transparent px-4 py-2 outline-none text-stone-700 font-medium"
                      />
                      <button 
                        onClick={() => addTask(selectedLead.id)} 
                        className="bg-stone-900 text-white px-6 py-2 rounded-xl hover:bg-stone-800 transition-all shadow-md active:scale-95"
                      >
                        <Icons.Plus />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedLead.tasks.length > 0 ? (
                        selectedLead.tasks.map(task => (
                          <div key={task.id} className="flex items-center gap-4 p-5 bg-white border-2 border-stone-50 rounded-2xl group hover:border-stone-900/10 transition-all hover:shadow-xl">
                            <input 
                              type="checkbox" 
                              checked={task.completed} 
                              onChange={() => toggleTask(selectedLead.id, task.id)}
                              className="w-6 h-6 accent-stone-900 rounded-lg cursor-pointer transition-transform active:scale-90"
                            />
                            <span className={`text-sm flex-1 transition-all ${task.completed ? 'text-stone-300 line-through' : 'text-stone-700 font-bold uppercase tracking-tight'}`}>
                              {task.description}
                            </span>
                            <button 
                              onClick={() => confirmDeleteTask(selectedLead.id, task.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-stone-300 hover:text-red-500 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                          <p className="text-[11px] text-stone-400 font-black uppercase tracking-[0.2em]">Nenhuma ação pendente</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-stone-100 pb-12">
                    <h5 className="text-[12px] font-black uppercase tracking-widest text-stone-400">Briefing Inicial e Anotações</h5>
                    <div className="text-base text-stone-700 bg-stone-50 p-8 rounded-3xl leading-relaxed italic border-l-8 border-stone-900 font-serif">
                      "{selectedLead.notes}"
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-8 border-t border-stone-100 flex gap-5 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              {isEditingLead ? (
                <>
                  <button 
                    onClick={() => setIsEditingLead(false)}
                    className="flex-1 py-5 bg-stone-100 text-stone-600 text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-200 transition-all active:scale-95"
                  >
                    Descartar Alterações
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    className="flex-1 py-5 bg-stone-900 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-800 transition-all shadow-2xl active:scale-95"
                  >
                    Salvar Lead
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleStartEdit}
                    className="flex-1 py-5 bg-stone-50 text-stone-500 border-2 border-stone-100 text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-100 transition-all"
                  >
                    Editar Cadastro
                  </button>
                  <button 
                    onClick={() => setSelectedLeadId(null)}
                    className="flex-1 py-5 bg-stone-900 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-800 transition-all shadow-2xl active:scale-95"
                  >
                    Fechar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Task Deletion */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-10 animate-slideUp border border-stone-200 text-center">
            <h4 className="text-2xl font-bold text-stone-800 mb-4 font-serif italic">Tem certeza que deseja excluir esta tarefa?</h4>
            <p className="text-sm text-stone-500 mb-10 font-medium">Esta ação removerá permanentemente este item da jornada comercial.</p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={executeDeleteTask}
                className="w-full py-5 bg-red-600 text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl active:scale-95"
              >
                Confirmar Exclusão
              </button>
              <button 
                onClick={() => setTaskToDelete(null)}
                className="w-full py-5 bg-stone-100 text-stone-600 text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-stone-200 transition-all"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border border-stone-100">
            <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h4 className="text-3xl font-bold text-stone-800 font-serif">Novo Prospect de Valor</h4>
                <p className="text-xs text-stone-400 mt-2 uppercase font-black tracking-[0.3em]">Cadastro Inicial de Funil</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-3 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nome Completo</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all" placeholder="Ex: Rodrigo Mendonça" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Onde nos conheceu?</label>
                  <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 transition-all appearance-none cursor-pointer font-bold text-stone-700">
                    <option>Instagram</option>
                    <option>Indicação de Cliente</option>
                    <option>Google / SEO</option>
                    <option>Revista de Arquitetura</option>
                    <option>Evento / Mostra</option>
                    <option>Outros Canais</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">E-mail Principal</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all" placeholder="cliente@luxo.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Ticket Previsto (R$)</label>
                  <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all" placeholder="Ex: 250000" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Fase Inicial</label>
                    <div className="w-full px-5 py-4 bg-stone-100 border-2 border-stone-100 rounded-2xl text-stone-500 text-sm font-black uppercase tracking-widest flex items-center">
                      {LeadStatus.PROSPECTION}
                    </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Briefing Executivo</label>
                <textarea required value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full h-32 px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 resize-none transition-all font-serif italic text-stone-600" placeholder="Quais os sonhos e dores deste cliente?" />
              </div>
              <button type="submit" className="w-full py-6 bg-stone-900 text-white font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl hover:bg-stone-800 transition-all shadow-2xl mt-6 active:scale-95">Iniciar Ciclo de Venda</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
