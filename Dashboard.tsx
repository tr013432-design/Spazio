
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sincronizado com Finance.tsx
const chartData = [
  { name: 'Set', revenue: 11000 },
  { name: 'Out', revenue: 14500 },
  { name: 'Nov', revenue: 12800 },
  { name: 'Dez', revenue: 0 },
  { name: 'Jan', revenue: 0 },
];

// Sincronizado com Projects.tsx
const recentProjects = [
  { title: 'Apartamento Ipanema', client: 'Beatriz L.', progress: 75 },
  { title: 'Casa de Campo - Itatiba', client: 'Ricardo M.', progress: 30 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stats Cards - Sincronizados com o estado das outras abas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Projetos Ativos', value: '02', trend: '+1 este mês', color: 'text-stone-800' },
          { label: 'Leads Novos', value: '03', trend: '+33% vs mês ant.', color: 'text-stone-800' },
          { label: 'Faturamento Total', value: 'R$ 24.750', trend: 'Recebido de R$ 60k', color: 'text-stone-800' },
          { label: 'Custos Pendentes', value: 'R$ 250', trend: 'Software ArchiFlow', color: 'text-red-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm transition-transform hover:scale-[1.02]">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">{stat.label}</p>
            <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
            <p className="text-xs text-stone-400 mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h4 className="text-lg font-bold mb-6 text-stone-800">Crescimento de Receita (Realizado)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" stroke="#a8a29e" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1c1917" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Projects - Mapeado dos dados reais */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
          <h4 className="text-lg font-bold mb-6 text-stone-800">Gestão de Obras Ativas</h4>
          <div className="space-y-4">
            {recentProjects.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                <div className="flex-1">
                  <p className="font-bold text-stone-800">{p.title}</p>
                  <p className="text-xs text-stone-500 font-medium">{p.client}</p>
                </div>
                <div className="w-32">
                  <div className="w-full bg-stone-100 rounded-full h-1.5 shadow-inner">
                    <div className="bg-stone-950 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-right mt-1 font-black uppercase text-stone-400">{p.progress}% concluído</p>
                </div>
              </div>
            ))}
            {recentProjects.length === 0 && (
              <div className="py-10 text-center text-stone-400 italic">Nenhum projeto ativo no momento.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
