import React, { useState, useEffect } from 'react';

// --- 1. DEFINIÇÕES LOCAIS (Para não depender de arquivos externos) ---

// Ícones SVG Inline para garantir que não quebre por falta de biblioteca
const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Calendar: ({ className }: { className?: string }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  WhatsApp: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
  Trash: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

// Enum Simulado
const LeadStatus = {
  PROSPECTION: 'Prospecção',
  TECHNICAL_VISIT: 'Visita Técnica',
  BRIEFING: 'Briefing',
  CONCEPT: 'Anteprojeto',
  SIGNED: 'Contrato Assinado',
  LOST: 'LOST' // Status interno para lógica
};

type LeadTemperature = 'hot' | 'warm' | 'cold';

interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  temperature?: LeadTemperature;
  nextActionDate?: string;
  createdAt: string;
  notes: string;
  budget: number;
  address?: string;
  taxId?: string;
  tasks: Task[];
}

// Dados iniciais
const initialLeads: Lead[] = [
  { 
    id: '1', 
    name: 'Marcos Vinicius', 
    email: 'marcos@email.com', 
    phone: '11988887777', 
    source: 'Instagram', 
    status: LeadStatus.PROSPECTION, 
    temperature: 'hot',
    nextActionDate: '2023-10-20', // Data propositalmente atrasada
    createdAt: '2023-10-25', 
    notes: 'Interesse em reforma de cobertura no Itaim. Busca estilo industrial chic.',
    budget: 85000,
    address: 'Av. Paulista, 1000 - SP',
    taxId: '123.456.789-00',
    tasks: [{ id: 't1', description: 'Enviar portfólio de coberturas luxo', completed: false }]
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
    notes: 'Consultoria de design de interiores para living.',
    budget: 15000,
    tasks: []
  },
];

// --- 2. COMPONENTE PRINCIPAL ---

const CRM: React.FC = () => {
  // State Management seguro
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window === 'undefined') return initialLeads;
    try {
      const saved = localStorage.getItem('archiflow_leads_v3');
      return saved ? JSON.parse(saved) : initialLeads;
    } catch (e) {
      return initialLeads;
    }
  });

  useEffect(() => {
    localStorage.setItem('archiflow_leads_v3', JSON.stringify(leads));
  }, [leads]);

  // States de UI
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  
  // States de Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);
  const [leadToLoseId, setLeadToLoseId] = useState<string | null>(null);
  const [lossReason, setLossReason] = useState('');

  // Form Data Novo Lead
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', notes: '', source: 'Instagram', budget: '', 
    temperature: 'warm' as LeadTemperature, nextActionDate: ''
  });

  const selectedLead = leads.find(l => l.id === selectedLeadId);
  const visibleStatuses = Object.values(LeadStatus).filter(s => s !== 'LOST');

  // --- LÓGICA AUXILIAR ---
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(dateString) < today;
  };

  const getTempColor = (temp?: LeadTemperature) => {
    switch(temp) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getStatusBorderColor = (lead: Lead) => {
    if (lead.nextActionDate && isOverdue(lead.nextActionDate)) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    switch (lead.status) {
      case LeadStatus.PROSPECTION: return 'border-stone-200';
      case LeadStatus.TECHNICAL_VISIT: return 'border-blue-400';
      case LeadStatus.BRIEFING: return 'border-amber-400';
      case LeadStatus.SIGNED: return 'border-green-500';
      default: return 'border-stone-200';
    }
  };

  // --- HANDLERS ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData('leadId', id);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId') || draggedLeadId;
    if (id) {
      if (newStatus === 'LOST') {
        setLeadToLoseId(id);
        setIsLossModalOpen(true);
      } else {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      }
    }
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  const handleNewLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      budget: Number(formData.budget),
      status: LeadStatus.PROSPECTION,
      createdAt: new Date().toISOString(),
      tasks: []
    };
    setLeads([newLead, ...leads]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', notes: '', source: 'Instagram', budget: '', temperature: 'warm', nextActionDate: '' });
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn relative pb-6">
      
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
        {visibleStatuses.map(status => (
          <div 
            key={status} 
            className={`flex-shrink-0 w-80 flex flex-col transition-all duration-300 ${dragOverStatus === status ? 'bg-stone-50 rounded-xl' : ''}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDrop={(e) => handleDrop(e, status)}
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
            
            <div className="flex-1 rounded-2xl p-3 space-y-3 bg-stone-100/30 border border-stone-100">
              {leads.filter(l => l.status === status).map(lead => (
                <div 
                  key={lead.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group relative border-l-4 ${getStatusBorderColor(lead)}`}
                >
                  {/* ALERTA DE ATRASO */}
                  {lead.nextActionDate && isOverdue(lead.nextActionDate) && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md animate-bounce z-10">
                      ATRASADO
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-stone-800 text-[15px] leading-tight">{lead.name}</h5>
                    <button 
                      onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${lead.phone.replace(/\D/g,'')}`, '_blank'); }} 
                      className="text-green-600 hover:text-green-700 hover:scale-110 transition-transform p-1 bg-green-50 rounded-full"
                    >
                      <Icons.WhatsApp />
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
                      <Icons.Calendar />
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

      {/* DROP ZONE: LIXEIRA */}
      {draggedLeadId && (
        <div 
          className={`absolute bottom-6 right-6 w-64 h-32 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all duration-300 z-30 ${dragOverStatus === 'LOST' ? 'bg-red-100 border-red-500 scale-110 shadow-2xl' : 'bg-white/90 border-stone-300 backdrop-blur'}`}
          onDragOver={(e) => handleDragOver(e, 'LOST')}
          onDrop={(e) => handleDrop(e, 'LOST')}
        >
          <div className="text-center pointer-events-none flex flex-col items-center">
            <div className={`mb-2 ${dragOverStatus === 'LOST' ? 'text-red-600' : 'text-stone-400'}`}>
                <Icons.Trash />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${dragOverStatus === 'LOST' ? 'text-red-700' : 'text-stone-400'}`}>
              Descartar / Perda
            </p>
          </div>
        </div>
      )}

      {/* MODAL NOVO LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
               <h4 className="text-2xl font-bold font-serif">Novo Lead</h4>
               <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>
            <form onSubmit={handleNewLeadSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
               <input required placeholder="Nome do Cliente" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
               
               <div className="grid grid-cols-2 gap-4">
                 <input placeholder="WhatsApp (apenas números)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                 <input type="number" placeholder="Budget Estimado" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Temperatura</label>
                   <select value={formData.temperature} onChange={e => setFormData({...formData, temperature: e.target.value as any})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-700 outline-none focus:border-stone-900">
                     <option value="hot">🔥 Quente</option>
                     <option value="warm">☀️ Morno</option>
                     <option value="cold">❄️ Frio</option>
                   </select>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Próximo Passo</label>
                   <input required type="date" value={formData.nextActionDate} onChange={e => setFormData({...formData, nextActionDate: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                 </div>
               </div>

               <textarea placeholder="Notas sobre o projeto..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 h-24 resize-none outline-none focus:border-stone-900" />
               
               <button type="submit" className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl active:scale-95">
                 Cadastrar Lead
               </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PERDA */}
      {isLossModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 animate-slideUp">
            <h4 className="text-xl font-bold text-stone-800 mb-2 font-serif">Confirmar Perda</h4>
            <p className="text-xs text-stone-500 mb-6">Por que este negócio não fechou?</p>
            <div className="space-y-3 mb-8">
              {['Preço muito alto', 'Concorrência', 'Desistiu do Projeto', 'Sem Contato'].map(reason => (
                <button key={reason} onClick={() => setLossReason(reason)} className={`w-full p-3 rounded-xl text-xs font-bold border-2 transition-all ${lossReason === reason ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 text-stone-600'}`}>
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => { 
                setLeads(prev => prev.filter(l => l.id !== leadToLoseId)); 
                setIsLossModalOpen(false); 
                setLeadToLoseId(null); 
            }} className="w-full py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all">Confirmar</button>
            <button onClick={() => setIsLossModalOpen(false)} className="w-full mt-3 text-stone-400 text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
