import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Lead, LeadStatus } from '../types';
import ProposalGenerator from './ProposalGenerator';
import { sendMobileNotification } from '../services/notificationService';

const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Calendar: ({ className }: { className?: string }) => <svg className={className || "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  WhatsApp: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
  Trash: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Pencil: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Map: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Spinner: () => <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>,
};

var STATUS_LIST = [
  LeadStatus.PROSPECTION,
  LeadStatus.TECHNICAL_VISIT,
  LeadStatus.BRIEFING,
  LeadStatus.CONCEPT,
  LeadStatus.SIGNED,
];

var CRM: React.FC = () => {
  var [leads, setLeads] = useState<Lead[]>([]);
  var [loading, setLoading] = useState(true);
  var [saving, setSaving] = useState(false);
  var [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  var [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  var [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  var [isProposalOpen, setIsProposalOpen] = useState(false);
  var [isModalOpen, setIsModalOpen] = useState(false);
  var [isEditing, setIsEditing] = useState(false);
  var [isLossModalOpen, setIsLossModalOpen] = useState(false);
  var [leadToLoseId, setLeadToLoseId] = useState<string | null>(null);
  var [lossReason, setLossReason] = useState('');
  var [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    source: 'Instagram', budget: '', temperature: 'warm', nextActionDate: ''
  });

  var fetchLeads = useCallback(async () => {
    setLoading(true);
    var result = await supabase.from('leads').select('*, tasks:lead_tasks(*)').order('created_at', { ascending: false });
    if (!result.error && result.data) setLeads(result.data as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  var selectedLead = leads.find(function(l) { return l.id === selectedLeadId; });

  var isOverdue = function(dateString?: string) {
    if (!dateString) return false;
    var today = new Date(); today.setHours(0,0,0,0);
    return new Date(dateString) < today;
  };

  var getTempColor = function(temp?: string) {
    if (temp === 'hot') return 'bg-red-100 text-red-700 border-red-200';
    if (temp === 'cold') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-amber-100 text-amber-700 border-amber-200';
  };

  var getStatusBorderColor = function(lead: Lead) {
    if (lead.next_action_date && isOverdue(lead.next_action_date)) return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    if (lead.status === LeadStatus.TECHNICAL_VISIT) return 'border-blue-400';
    if (lead.status === LeadStatus.BRIEFING) return 'border-amber-400';
    if (lead.status === LeadStatus.SIGNED) return 'border-green-500';
    return 'border-stone-200';
  };

  var columnTotal = function(status: string) {
    return leads.filter(function(l) { return l.status === status; }).reduce(function(sum, l) { return sum + (Number(l.budget) || 0); }, 0);
  };

  var handleDragStart = function(e: React.DragEvent, id: string) {
    setDraggedLeadId(id);
    e.dataTransfer.setData('leadId', id);
  };

  var handleDragOver = function(e: React.DragEvent, status: string) {
    e.preventDefault();
    if (dragOverStatus !== status) setDragOverStatus(status);
  };

  var handleDrop = async function(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    var id = e.dataTransfer.getData('leadId') || draggedLeadId;
    if (id) {
      if (newStatus === 'LOST') {
        setLeadToLoseId(id);
        setIsLossModalOpen(true);
      } else {
        setLeads(function(prev) { return prev.map(function(l) { return l.id === id ? { ...l, status: newStatus } : l; }); });
        await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      }
    }
    setDraggedLeadId(null);
    setDragOverStatus(null);
  };

  var handleOpenNewLead = function() {
    setFormData({ name: '', email: '', phone: '', address: '', notes: '', source: 'Instagram', budget: '', temperature: 'warm', nextActionDate: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  var handleEditLead = function() {
    if (!selectedLead) return;
    setFormData({
      name: selectedLead.name, email: selectedLead.email, phone: selectedLead.phone,
      address: selectedLead.address || '', notes: selectedLead.notes, source: selectedLead.source,
      budget: String(selectedLead.budget), temperature: selectedLead.temperature || 'warm',
      nextActionDate: selectedLead.next_action_date || ''
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  var handleLeadSubmit = async function(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    var payload = {
      name: formData.name, email: formData.email, phone: formData.phone,
      address: formData.address, notes: formData.notes, source: formData.source,
      budget: Number(formData.budget), temperature: formData.temperature,
      next_action_date: formData.nextActionDate || null,
    };
    if (isEditing && selectedLeadId) {
      var res = await supabase.from('leads').update(payload).eq('id', selectedLeadId).select('*, tasks:lead_tasks(*)').single();
      if (res.data) setLeads(function(prev) { return prev.map(function(l) { return l.id === selectedLeadId ? res.data as Lead : l; }); });
      sendMobileNotification("Lead Atualizado! 📝", "Cliente: " + formData.name);
    } else {
      var res2 = await supabase.from('leads').insert({ ...payload, status: LeadStatus.PROSPECTION }).select('*, tasks:lead_tasks(*)').single();
      if (res2.data) {
        setLeads(function(prev) { return [res2.data as Lead, ...prev]; });
        sendMobileNotification("Novo Lead! 🚀", "Cliente: " + formData.name + "\nValor: R$ " + Number(formData.budget).toLocaleString('pt-BR'));
      }
    }
    setSaving(false);
    setIsModalOpen(false);
    setIsEditing(false);
  };

  var confirmLoss = async function() {
    if (leadToLoseId) {
      await supabase.from('leads').delete().eq('id', leadToLoseId);
      setLeads(function(prev) { return prev.filter(function(l) { return l.id !== leadToLoseId; }); });
      sendMobileNotification("Lead Perdido ⚠️", "Motivo: " + lossReason);
      setIsLossModalOpen(false);
      setLeadToLoseId(null);
      setLossReason('');
      if (selectedLeadId === leadToLoseId) setSelectedLeadId(null);
    }
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-stone-400">
        <Icons.Spinner />
        <p className="text-xs font-bold uppercase tracking-widest">Carregando leads...</p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col space-y-6 animate-fadeIn relative pb-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h3 className="text-2xl font-bold text-stone-800 font-serif">Pipeline Comercial</h3>
          <p className="text-sm text-stone-500">
            {leads.length} leads · R$ {leads.reduce(function(s, l) { return s + (Number(l.budget) || 0); }, 0).toLocaleString('pt-BR')} em aberto
          </p>
        </div>
        <button onClick={handleOpenNewLead} className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-all text-sm font-bold shadow-lg active:scale-95">
          <Icons.Plus /> Novo Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 flex gap-6 custom-scrollbar min-h-[600px]">
        {STATUS_LIST.map(function(status) { return (
          <div
            key={status}
            className={"flex-shrink-0 w-80 flex flex-col transition-all duration-300 " + (dragOverStatus === status ? 'bg-stone-50 rounded-xl' : '')}
            onDragOver={function(e) { handleDragOver(e, status); }}
            onDrop={function(e) { handleDrop(e, status); }}
          >
            <div className="flex items-center justify-between mb-1 px-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                <span className={"w-2 h-2 rounded-full " + (dragOverStatus === status ? 'bg-stone-900' : 'bg-stone-300')}></span>
                {status}
              </h4>
              <span className="bg-stone-200/60 text-stone-600 text-[9px] font-black px-2.5 py-1 rounded-full">
                {leads.filter(function(l) { return l.status === status; }).length}
              </span>
            </div>
            <div className="px-2 mb-3">
              <p className="text-[10px] font-bold text-stone-400">
                R$ {columnTotal(status).toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="flex-1 rounded-2xl p-3 space-y-3 bg-stone-100/30 border border-stone-100">
              {leads.filter(function(l) { return l.status === status; }).map(function(lead) { return (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={function(e) { handleDragStart(e, lead.id); }}
                  onClick={function() { setSelectedLeadId(lead.id); }}
                  className={"bg-white rounded-xl border p-4 shadow-sm hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group relative border-l-4 " + getStatusBorderColor(lead)}
                >
                  {lead.next_action_date && isOverdue(lead.next_action_date) && (
                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-md animate-bounce z-10">ATRASADO</div>
                  )}
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold text-stone-800 text-[15px] leading-tight">{lead.name}</h5>
                    <button onClick={function(e) { e.stopPropagation(); window.open('https://wa.me/55' + lead.phone.replace(/\D/g,''), '_blank'); }} className="text-green-600 hover:text-green-700 hover:scale-110 transition-transform p-1 bg-green-50 rounded-full">
                      <Icons.WhatsApp />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={"text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border " + getTempColor(lead.temperature)}>
                      {lead.temperature === 'hot' ? 'Quente' : lead.temperature === 'warm' ? 'Morno' : 'Frio'}
                    </span>
                    <span className="text-[10px] text-stone-400 font-bold ml-auto">
                      {lead.budget ? 'R$ ' + Number(lead.budget).toLocaleString('pt-BR') : '-'}
                    </span>
                  </div>
                  {lead.next_action_date && (
                    <div className={"mt-3 flex items-center gap-2 text-[10px] p-1.5 rounded " + (isOverdue(lead.next_action_date) ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-500')}>
                      <Icons.Calendar />
                      <span className="font-bold">Próx:</span>
                      {new Date(lead.next_action_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              ); })}
            </div>
          </div>
        ); })}
      </div>

      {draggedLeadId && (
        <div
          className={"absolute bottom-6 right-6 w-64 h-32 rounded-3xl border-2 border-dashed flex items-center justify-center transition-all duration-300 z-30 " + (dragOverStatus === 'LOST' ? 'bg-red-100 border-red-500 scale-110 shadow-2xl' : 'bg-white/90 border-stone-300 backdrop-blur')}
          onDragOver={function(e) { handleDragOver(e, 'LOST'); }}
          onDrop={function(e) { handleDrop(e, 'LOST'); }}
        >
          <div className="text-center pointer-events-none flex flex-col items-center">
            <div className={"mb-2 " + (dragOverStatus === 'LOST' ? 'text-red-600' : 'text-stone-400')}><Icons.Trash /></div>
            <p className={"text-[10px] font-black uppercase tracking-widest " + (dragOverStatus === 'LOST' ? 'text-red-700' : 'text-stone-400')}>Descartar / Perda</p>
          </div>
        </div>
      )}

      {selectedLead && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-sm" onClick={function() { setSelectedLeadId(null); }}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slideRight flex flex-col overflow-y-auto pt-24">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50">
              <div>
                <h2 className="text-3xl font-serif font-bold text-stone-900">{selectedLead.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={"px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest " + getTempColor(selectedLead.temperature)}>
                    {selectedLead.temperature === 'hot' ? '🔥 Quente' : selectedLead.temperature === 'warm' ? '☀️ Morno' : '❄️ Frio'}
                  </span>
                  <span className="text-xs font-bold text-stone-400">{selectedLead.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleEditLead} className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-300 transition-colors">
                  <Icons.Pencil /> Editar
                </button>
                <button onClick={function() { setSelectedLeadId(null); }} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-500">✕</button>
              </div>
            </div>
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <button onClick={function() { window.open('https://wa.me/55' + selectedLead.phone.replace(/\D/g,''), '_blank'); }} className="py-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                  <Icons.WhatsApp /> WhatsApp
                </button>
                <button onClick={function() { setIsProposalOpen(true); }} className="py-4 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                  <span className="text-lg">📄</span> Gerar Proposta
                </button>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Dados Principais</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Budget</p>
                    <p className="text-lg font-serif font-bold text-stone-800">R$ {Number(selectedLead.budget).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Origem</p>
                    <p className="text-sm font-bold text-stone-700">{selectedLead.source}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Contato & Local</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400"><Icons.Map /></div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Local da Obra</p>
                      <p className="text-sm font-medium text-stone-800">{selectedLead.address || 'Não informado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">@</div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-stone-400">Email</p>
                      <p className="text-sm font-medium text-stone-800">{selectedLead.email || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-2 mb-4">Notas & Briefing</h4>
                <p className="text-sm text-stone-600 bg-stone-50 p-4 rounded-xl italic">"{selectedLead.notes}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedLead && (
        <ProposalGenerator isOpen={isProposalOpen} onClose={function() { setIsProposalOpen(false); }} lead={{ name: selectedLead.name, email: selectedLead.email, budget: Number(selectedLead.budget) || 0, notes: selectedLead.notes, address: selectedLead.address }} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[30px] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
              <h4 className="text-2xl font-bold font-serif">{isEditing ? 'Editar Lead' : 'Novo Lead'}</h4>
              <button onClick={function() { setIsModalOpen(false); }} className="text-stone-400 hover:text-stone-900 font-bold">✕</button>
            </div>
            <form onSubmit={handleLeadSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <input required placeholder="Nome do Cliente" value={formData.name} onChange={function(e) { setFormData({...formData, name: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="WhatsApp (apenas números)" value={formData.phone} onChange={function(e) { setFormData({...formData, phone: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
                <input type="email" placeholder="Email" value={formData.email} onChange={function(e) { setFormData({...formData, email: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
              </div>
              <input placeholder="Endereço / Local da Obra" value={formData.address} onChange={function(e) { setFormData({...formData, address: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.source} onChange={function(e) { setFormData({...formData, source: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600 outline-none focus:border-stone-900">
                  <option value="Instagram">Instagram</option>
                  <option value="Google">Google / Site</option>
                  <option value="Indicação">Indicação</option>
                  <option value="Pinterest">Pinterest</option>
                  <option value="Outros">Outros</option>
                </select>
                <input type="number" placeholder="Budget (R$)" value={formData.budget} onChange={function(e) { setFormData({...formData, budget: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Temperatura</label>
                  <select value={formData.temperature} onChange={function(e) { setFormData({...formData, temperature: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-700 outline-none focus:border-stone-900">
                    <option value="hot">🔥 Quente</option>
                    <option value="warm">☀️ Morno</option>
                    <option value="cold">❄️ Frio</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400 ml-1">Próximo Passo</label>
                  <input required type="date" value={formData.nextActionDate} onChange={function(e) { setFormData({...formData, nextActionDate: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 outline-none focus:border-stone-900" />
                </div>
              </div>
              <textarea placeholder="Notas sobre o projeto..." value={formData.notes} onChange={function(e) { setFormData({...formData, notes: e.target.value}); }} className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 h-24 resize-none outline-none focus:border-stone-900" />
              <button type="submit" disabled={saving} className="w-full py-4 bg-stone-900 text-white font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                {saving ? <><Icons.Spinner /> Salvando...</> : (isEditing ? 'Salvar Alterações' : 'Cadastrar Lead')}
              </button>
            </form>
          </div>
        </div>
      )}

      {isLossModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 animate-slideUp">
            <h4 className="text-xl font-bold text-stone-800 mb-2 font-serif">Confirmar Perda</h4>
            <p className="text-xs text-stone-500 mb-6">Por que este negócio não fechou?</p>
            <div className="space-y-3 mb-8">
              {['Preço muito alto', 'Concorrência', 'Desistiu do Projeto', 'Sem Contato'].map(function(reason) { return (
                <button key={reason} onClick={function() { setLossReason(reason); }} className={"w-full p-3 rounded-xl text-xs font-bold border-2 transition-all " + (lossReason === reason ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 bg-stone-50 text-stone-600')}>
                  {reason}
                </button>
              ); })}
            </div>
            <button onClick={confirmLoss} className="w-full py-4 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all">Confirmar</button>
            <button onClick={function() { setIsLossModalOpen(false); }} className="w-full mt-3 text-stone-400 text-[10px] font-bold uppercase tracking-widest">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRM;
