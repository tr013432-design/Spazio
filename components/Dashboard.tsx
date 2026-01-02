import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// DADOS DO GRÁFICO ATUALIZADOS
// Lógica: 'revenue' é o realizado. 'projected' é a previsão futura.
// Nota: Novembro tem ambos para conectar as linhas visualmente.
const chartData = [
  { name: 'Set', revenue: 11000, projected: null },
  { name: 'Out', revenue: 14500, projected: null },
  { name: 'Nov', revenue: 12800, projected: 12800 }, // Ponto de conexão
  { name: 'Dez', revenue: null, projected: 18500 },  // Previsão baseada em contratos
  { name: 'Jan', revenue: null, projected: 22000 },  // Previsão de crescimento
];

// DADOS DE PROJETOS COM STATUS
const recentProjects = [
  { 
    title: 'Apartamento Ipanema', 
    client: 'Beatriz L.', 
    progress: 75, 
    deadline: '15/01', 
    status: 'alert', // normal, alert, delayed
    nextAction: 'Aprovar Marcenaria'
  },
  { 
    title: 'Casa de Campo - Itatiba', 
    client: 'Ricardo M.', 
    progress: 30, 
    deadline: '20/02', 
    status: 'normal',
    nextAction: 'Visita Técnica'
  },
  { 
    title: 'Studio Leblon', 
    client: 'Carlos E.', 
    progress: 90, 
    deadline: '05/01', 
    status: 'delayed',
    nextAction: 'Entrega Final'
  },
];

// Componente auxiliar para Status Badge
const StatusBadge = ({ status, deadline }: { status: string, deadline: string }) => {
  const colors = {
    normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    alert: 'bg-amber-100 text-amber-700 border-amber-200',
    delayed: 'bg-red-100 text-red-700 border-red-200',
  };
  
  const labels = {
    normal: 'Em dia',
    alert: 'Atenção',
    delayed: 'Atrasado',
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${colors[status as keyof typeof colors]}`}>
      <span className="text-[10px] font-bold uppercase tracking-wide">{labels[status as keyof typeof labels]}</span>
      <span className="text-[10px] opacity-75 border-l border-current pl-2">{deadline}</span>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* HEADER DE BOAS VINDAS (Opcional, mas dá um toque pessoal) */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif text-stone-900">Visão Geral</h2>
          <p className="text-stone-500 text-sm">Resumo financeiro e operacional da semana.</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Previsão Dezembro</p>
          <p className="text-xl font-bold text-stone-800">R$ 18.500</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Projetos Ativos', value: '03', trend: '+1 este mês', color: 'text-stone-800' },
          { label: 'Leads Quentes', value: '05', trend: 'R$ 120k em propostas', color: 'text-stone-800' },
          { label: 'Caixa Realizado', value: 'R$ 38.300', trend: 'Trimestral', color: 'text-stone-800' },
          { label: 'Custos Pendentes', value: 'R$ 250', trend: 'Vence hoje', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">{stat.label}</p>
            <h3 className={`text-3xl font-serif ${stat.color}`}>{stat.value}</h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Chart - Ocupa 2 colunas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-stone-800 font-serif">Fluxo de Receita & Projeção</h4>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-stone-900"></span>
                <span className="text-stone-500">Realizado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-stone-400 border-dashed"></span>
                <span className="text-stone-500">Projeção</span>
              </div>
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
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a8a29e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a8a29e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}
                  formatter={(value: number) => [`R$ ${value}`, '']}
                  labelStyle={{ color: '#a8a29e', marginBottom: '0.5rem', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                />
                
                {/* Área de Realizado (Preto Sólido) */}
                <Area type="monotone" dataKey="revenue" stroke="#1c1917" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                
                {/* Área de Projeção (Cinza Tracejado) */}
                <Area type="monotone" dataKey="projected" stroke="#a8a29e" strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProj)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects - Ocupa 1 coluna */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col h-full">
          <h4 className="text-lg font-bold mb-6 text-stone-800 font-serif">Gestão de Prazos</h4>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {recentProjects.map((p, i) => (
              <div key={i} className="group p-3 -mx-3 rounded-lg hover:bg-stone-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-stone-800 text-sm">{p.title}</p>
                    <p className="text-xs text-stone-500">{p.client}</p>
                  </div>
                  <StatusBadge status={p.status} deadline={p.deadline} />
                </div>
                
                {/* Barra de Progresso */}
                <div className="relative pt-2">
                  <div className="flex justify-between text-[10px] text-stone-400 mb-1 uppercase tracking-wider font-bold">
                    <span>Progresso</span>
                    <span>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${p.status === 'delayed' ? 'bg-red-500' : 'bg-stone-900'}`} 
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Next Action - Micro interação */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500 bg-white border border-stone-100 p-2 rounded shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span className="font-semibold">Próximo:</span> {p.nextAction}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 border-t border-stone-100 transition-colors">
            Ver Cronograma Completo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
