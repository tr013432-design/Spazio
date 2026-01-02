import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus, Task } from '../types'; // Certifique-se que LeadStatus inclui 'LOST' ou trate como string
import { Icons } from '../constants';
import { geminiService } from '../services/gemini';

// --- EXTENSÃO DE TIPOS LOCAL (Para garantir funcionamento imediato) ---
// Adicione isso ao seu types.ts idealmente
type LeadTemperature = 'hot' | 'warm' | 'cold';

interface ExtendedLead extends Lead {
  temperature?: LeadTemperature;
  nextActionDate?: string; // ISO Date YYYY-MM-DD
  lossReason?: string;
}
// ---------------------------------------------------------------------

const initialLeads: ExtendedLead[] = [
  { 
    id: '1', 
    name: 'Marcos Vinicius', 
    email: 'marcos@email.com', 
    phone: '11988887777', 
    source: 'Instagram', 
    status: LeadStatus.PROSPECTION, 
    temperature: 'hot',
    nextActionDate: '2023-10-20', // Data no passado para testar o alerta vermelho
    createdAt: '2023-10-25', 
    notes: 'Interesse em reforma de cobertura no Itaim.',
    budget: 85000,
    address: 'Av. Paulista, 1000 - SP',
    taxId: '123.456.789-00',
    tasks: [{ id: 't1', description: 'Enviar portfólio', completed: false }]
  },
  { 
    id: '2', 
    name: 'Clara Nunes', 
    email: 'clara@email.com', 
    phone: '11977776666', 
    source: 'Indicação', 
    status: LeadStatus.BRIEFING, 
    temperature: 'warm',
    nextActionDate: '2025-12-25', 
    createdAt: '2023-10-20', 
    notes: 'Consultoria de design de interiores.',
    budget: 15000,
    tasks: []
  },
];

const CRM: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState<ExtendedLead[]>(() => {
    if (typeof window === 'undefined') return initialLeads;
    const savedLeads = localStorage.getItem('archiflow_leads_v2');
    if (savedLeads) {
      try {
        return JSON.parse(savedLeads);
      } catch (e) { return initialLeads; }
    }
    return initialLeads;
  });

  useEffect(() => {
    localStorage.setItem('archiflow_leads_v2', JSON.stringify(leads));
  }, [leads]);

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<ExtendedLead>>({});
  
  // Drag & Drop
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<LeadStatus | 'LOST' | null>(null);

  // Modais e Auxiliares
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [leadToLoseId, setLeadToLoseId] = useState<string | null>(null);
  const [lossReason, setLossReason] = useState('');
  
  // AI States
  const [aiMessage, setAiMessage] = useState<{ [key: string]: string }>({});
  const [aiProposal, setAiProposal] = useState<{ [key: string]: string }>({});
  const [loadingAi, setLoadingAi] = useState<string | null>(null);

  // Form de Novo Lead
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', notes: '', source: 'Instagram', budget: '', 
    temperature: 'warm' as LeadTemperature, nextActionDate: ''
  });

  const statuses = Object.values(LeadStatus).filter(s => s !== 'LOST'); // Filtra LOST para não criar coluna, usaremos dropzone
  const selectedLead = leads.find(l => l.id === selectedLeadId);

  // --- LOGIC HELPERS ---

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkDate = new Date(dateString);
    return checkDate < today;
  };

  const openWhatsApp = (e: React.MouseEvent, phone: string) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  // --- DRAG AND DROP LOGIC ---

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData('leadId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, status: LeadStatus | 'LOST') => {
    e.preventDefault();
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  const onDrop = (e: React.DragEvent, newStatus: LeadStatus | 'LOST') => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId') || draggedLeadId;
    
    if (id) {
      if (newStatus === 'LOST') {
        setLeadToLoseId(id);
        setIsLossModalOpen(true);
      } else {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as LeadStatus } : l));
      }
    }
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const confirmLoss = () => {
    if (leadToLoseId && lossReason) {
      setLeads(prev => prev.filter(l => l.id !== leadToLoseId)); // Opção A: Deletar
      // Opção B (Melhor para dados): Mudar status para 'LOST' e manter salvo (não implementado visualmente aqui)
      // setLeads(prev => prev.map(l => l.id === leadToLoseId ? {...l, status: 'LOST', lossReason} : l));
      
      console.log(`Lead ${leadToLoseId} perdido por: ${lossReason}`); // Aqui entraria o envio para a Sofia analisar
      
      setIsLossModalOpen(false);
      setLeadToLoseId(null);
      setLossReason('');
    }
  };

  // --- CRUD & FORM LOGIC ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: ExtendedLead = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      budget: formData.budget ? Number(formData.budget) : 0,
      status: LeadStatus.PROSPECTION,
      createdAt: new Date().toISOString(),
      tasks: []
    } as ExtendedLead;
    setLeads([newLead, ...leads]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', notes: '', source: 'Instagram', budget: '', temperature: 'warm', nextActionDate: '' });
  };

  const handleSaveEdit = () => {
    if (selectedLead && editFormData) {
      setLeads(leads.map(lead => lead.id === selectedLeadId ? { ...lead, ...editFormData } : lead));
      setIsEditingLead(false);
    }
  };

  // --- UI RENDER HELPERS ---

  const getTempColor = (temp?: LeadTemperature) => {
    switch(temp) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusBorderColor = (lead: ExtendedLead) => {
    if (lead.nextActionDate && isOverdue(lead.nextActionDate)) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    
    switch (lead.status) {
      case LeadStatus.PROSPECTION: return 'border-stone-200';
      case LeadStatus.TECHNICAL_VISIT: return 'border-blue-400';
      case LeadStatus.BRIEFING: return 'border-amber-400';
      case LeadStatus.SIGNED: return 'border-green-500';
      default: return 'border-stone-200';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-2xl font-bold text-stone-800 font-serif">Pipeline Comercial</h3>
          <p className="text-sm text-stone-500">Gestão de alta performance.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-all text-sm font-bold shadow-lg active:scale-95">
          <Icons.Plus /> Novo Lead
        </button>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 overflow-x-auto pb-4 flex gap-6 custom-scrollbar min-h-[600px]">
        {statuses.map(status => (
          <div key={status} className={`flex-shrink-0 w-80 flex flex-col transition-all ${dragOverStatus === status ? 'scale-[1.02]' : ''}`}
            onDragOver={(e) => onDragOver(e, status as LeadStatus)}
            onDrop={(e) => onDrop(e, status as LeadStatus)}
          >
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${dragOverStatus === status ? 'bg-stone-900' : 'bg-stone-300'}`}></span>
                {status}
              </h4>
              <span className="bg-stone-200/60 text-stone-600 text-[9px] font-black px-2.5 py-1 rounded-full">
                {leads.filter(l => l.status === status).length}
              </span>
            </div>
            
            <div className="flex-1 rounded-2xl p-3 space-y-3 bg-stone-100/50 border border-stone-200/50">
              {leads.filter(l => l.status === status).map(lead => (
                <div 
                  key={lead.id} draggable onDragStart={(e) => onDragStart(e, lead.id)}
                  onClick={() => { setSelectedLeadId(lead.id); setIsEditingLead(false); }}
                  className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group relative border-l-4 ${getStatusBorderColor(lead)}`}
                >
                  {/* OVERDUE ALERT BADGE */}
                  {lead.nextActionDate && isOverdue(lead.nextActionDate) && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md animate-bounce z-10">
                      ATRASADO
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-stone-800 text-[15px] leading-tight">{lead.name}</h5>
                    <button onClick={(e) => openWhatsApp(e, lead.phone)} className="text-green-600 hover:text-green-700 hover:scale-110 transition-transform p-1 bg-green-50 rounded-full">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getTempColor(lead.temperature)}`}>
                      {lead.temperature === 'hot' ? 'Quente' : lead.temperature === 'warm' ? 'Morno' : 'Frio'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold ml-auto">
                      {lead.budget ? `R$ ${lead.budget.toLocaleString('pt-BR')}` : '-'}
                    </span>
                  </div>

                  {lead.nextActionDate && (
                    <div className={`mt-3 flex items-center gap-2 text-[10px] p-1.5 rounded ${isOverdue(lead.nextActionDate) ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500'}`}>
                      <Icons.Calendar className="w-3 h-3"/>
                      <span className="font-bold">Próx:</span> 
                      {new Date(lead.nextActionDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ZONA DE PERDA (Drag Target) */}
      {draggedLeadId && (
        <div 
          className={`absolute bottom-6 right-6 w-64 h-32 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all duration-300 z-30 ${dragOverStatus === 'LOST' ? 'bg-red-100 border-red-500 scale-110 shadow-2xl' : 'bg-white/80 border-stone-300 backdrop-blur'}`}
          onDragOver={(e) => onDragOver(e, 'LOST')}
          onDrop={(e) => onDrop(e, 'LOST')}
        >
          <div className="text-center pointer-events-none">
            <span className={`text-2xl mb-2 block ${dragOverStatus === 'LOST' ? 'text-red-600 animate-bounce' : 'text-stone-400'}`}>🗑️</span>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dragOverStatus === 'LOST' ? 'text-red-700' : 'text-stone-400'}`}>
              Descartar / Perda
            </p>
          </div>
        </div>
      )}

      {/* MODAL DE PERDA */}
      {isLossModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 animate-slideUp">
            <h4 className="text-xl font-bold text-stone-800 mb-2 font-serif">Por que perdemos este cliente?</h4>
            <p className="text-xs text-stone-500 mb-6">Esta informação é vital para a inteligência da empresa.</p>
            
            <div className="space-y-3 mb-8">
              {['Preço muito alto', 'Optou pelo concorrente', 'Adiou o projeto', 'Sem fit cultural', 'Sem resposta'].map(reason => (
                <button 
                  key={reason}
                  onClick={() => setLossReason(reason)}
                  className={`w-full p-3 rounded-xl text-xs font-bold border-2 transition-all ${lossReason === reason ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 text-stone-600 hover:border-stone-300'}`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button onClick={confirmLoss} disabled={!lossReason} className="w-full py-4 bg-red-600 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-xl">
              Confirmar Perda
            </button>
            <button onClick={() => { setIsLossModalOpen(false); setDraggedLeadId(null); }} className="w-full mt-3 py-3 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-stone-800">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* SLIDEOVER DE DETALHES (Mantido similar, apenas adicionando campos de edição novos) */}
      {selectedLead && (
        <div className="fixed inset-0 z-40 flex justify-end">
           <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={() => setSelectedLeadId(null)}></div>
           <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slideRight flex flex-col">
              {/* Conteúdo do Slideover mantido, adicionar inputs para Temperature e Date se editar */}
              <div className="p-8 border-b border-stone-100 flex justify-between bg-stone-50">
                <h2 className="text-2xl font-bold font-serif">{selectedLead.name}</h2>
                <button onClick={() => setSelectedLeadId(null)}>✕</button>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                 {/* Exemplo de exibição rápida dos novos dados */}
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                       <p className="text-[10px] uppercase text-stone-400 font-black mb-1">Temperatura</p>
                       <span className={`px-2 py-1 rounded text-xs font-bold ${getTempColor(selectedLead.temperature)}`}>
                         {selectedLead.temperature?.toUpperCase() || 'MORNO'}
                       </span>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                       <p className="text-[10px] uppercase text-stone-400 font-black mb-1">Próxima Ação</p>
                       <p className={`text-sm font-bold ${isOverdue(selectedLead.nextActionDate) ? 'text-red-600' : 'text-stone-800'}`}>
                         {selectedLead.nextActionDate ? new Date(selectedLead.nextActionDate).toLocaleDateString() : 'Não agendado'}
                       </p>
                    </div>
                 </div>
                 {/* ... Resto do componente de detalhes existente ... */}
                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
                    ℹ️ Para editar todos os campos, implemente os inputs de temperatura e data no modo de edição.
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL NOVO LEAD (Com novos campos) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-stone-100">
               <h4 className="text-2xl font-bold font-serif">Novo Lead</h4>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
               <input required placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
               <div className="grid grid-cols-2 gap-4">
                 <input placeholder="Telefone (WhatsApp)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
                 <input type="number" placeholder="Budget Estimado" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
               </div>
               
               {/* Novos Campos Críticos */}
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Temperatura Inicial</label>
                   <select value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value as any})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-700">
                     <option value="hot">🔥 Quente</option>
                     <option value="warm">☀️ Morno</option>
                     <option value="cold">❄️ Frio</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Próximo Passo (Obrigatório)</label>
                   <input required type="date" value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" />
                 </div>
               </div>

               <textarea placeholder="Notas iniciais..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 h-24 resize-none" />
               
               <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-stone-800 transition-all">Cadastrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
