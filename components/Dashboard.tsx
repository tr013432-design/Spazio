import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabase';

var Dashboard: React.FC = function() {
  var [stats, setStats] = useState({
    activeProjects: 0, hotLeads: 0, totalRevenue: 0, pendingCosts: 0, totalLeadValue: 0,
  });
  var [recentProjects, setRecentProjects] = useState<any[]>([]);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    var fetchData = async function() {
      setLoading(true);
      var results = await Promise.all([
        supabase.from('leads').select('status, temperature, budget'),
        supabase.from('projects').select('id, title, client_name, stage, deadline, total_value, paid_value, costs').order('created_at', { ascending: false }).limit(3),
      ]);
      var leads = results[0].data || [];
      var projects = results[1].data || [];
      setStats({
        activeProjects: projects.filter(function(p: any) { return p.stage !== 'Entrega'; }).length,
        hotLeads: leads.filter(function(l: any) { return l.temperature === 'hot'; }).length,
        totalRevenue: projects.reduce(function(s: number, p: any) { return s + (Number(p.paid_value) || 0); }, 0),
        pendingCosts: projects.reduce(function(s: number, p: any) { return s + (Number(p.costs) || 0); }, 0),
        totalLeadValue: leads.reduce(function(s: number, l: any) { return s + (Number(l.budget) || 0); }, 0),
      });
      setRecentProjects(projects);
      setLoading(false);
    };
    fetchData();
  }, []);

  var getDeadlineStatus = function(deadline?: string) {
    if (!deadline) return 'normal';
    var today = new Date(); today.setHours(0,0,0,0);
    var diff = (new Date(deadline).getTime() - today.getTime()) / (1000*60*60*24);
    if (diff < 0) return 'delayed';
    if (diff < 15) return 'alert';
    return 'normal';
  };

  var statusColors: Record<string, string> = { normal: 'bg-emerald-100 text-emerald-700', alert: 'bg-amber-100 text-amber-700', delayed: 'bg-red-100 text-red-700' };
  var statusLabels: Record<string, string> = { normal: 'Em dia', alert: 'Atenção', delayed: 'Atrasado' };

  var chartData = [
    { name: 'Mar', revenue: 9000 },
    { name: 'Abr', revenue: 11500 },
    { name: 'Mai', revenue: 10200 },
    { name: 'Jun', revenue: 13800 },
    { name: 'Jul', revenue: stats.totalRevenue > 0 ? stats.totalRevenue : 12000 },
  ];

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-stone-400">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <p className="text-xs font-bold uppercase tracking-widest">Carregando dados...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Visão Geral</h2>
          <p className="text-stone-500 text-sm">Resumo financeiro e operacional em tempo real.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Propostas em aberto</p>
          <p className="text-xl font-bold text-stone-800">R$ {stats.totalLeadValue.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Projetos Ativos', value: String(stats.activeProjects).padStart(2, '0'), trend: 'Em andamento' },
          { label: 'Leads Quentes', value: String(stats.hotLeads).padStart(2, '0'), trend: 'R$ ' + stats.totalLeadValue.toLocaleString('pt-BR') + ' em propostas' },
          { label: 'Receita Recebida', value: 'R$ ' + stats.totalRevenue.toLocaleString('pt-BR'), trend: 'Total acumulado' },
          { label: 'Custos Registrados', value: 'R$ ' + stats.pendingCosts.toLocaleString('pt-BR'), trend: 'Total em projetos' },
        ].map(function(stat, i) { return (
          <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">{stat.label}</p>
            <h3 className="text-3xl font-serif text-stone-800">{stat.value}</h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">{stat.trend}</p>
          </div>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-stone-800 font-serif">Receita Acumulada</h4>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-900"></span>
              <span className="text-xs text-stone-500">Recebido</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }} formatter={function(value: number) { return ['R$ ' + value.toLocaleString('pt-BR'), '']; }} labelStyle={{ color: '#a8a29e', marginBottom: '0.5rem', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1c1917" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <h4 className="text-lg font-bold mb-6 text-stone-800 font-serif">Gestão de Prazos</h4>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {recentProjects.length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4">Nenhum projeto cadastrado ainda.</p>
            )}
            {recentProjects.map(function(p, i) {
              var status = getDeadlineStatus(p.deadline);
              var progress = p.total_value > 0 ? Math.round((p.paid_value / p.total_value) * 100) : 0;
              return (
                <div key={i} className="group p-3 -mx-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-stone-800 text-sm">{p.title}</p>
                      <p className="text-xs text-stone-500">{p.client_name}</p>
                    </div>
                    <span className={"text-[10px] font-bold px-2 py-1 rounded " + statusColors[status]}>{statusLabels[status]}</span>
                  </div>
                  <div className="relative pt-2">
                    <div className="flex justify-between text-[10px] text-stone-400 mb-1 uppercase tracking-wider font-bold">
                      <span>Recebido</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div className={"h-1.5 rounded-full transition-all duration-1000 " + (status === 'delayed' ? 'bg-red-500' : 'bg-stone-900')} style={{ width: progress + '%' }}></div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500 bg-white border border-stone-100 p-2 rounded shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="font-semibold">Fase:</span> {p.stage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
