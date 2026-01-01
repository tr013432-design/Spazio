import React from 'react';
import { Icons } from '../constants';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-4xl font-bold text-stone-900 font-serif">Visão Geral</h2>
        <p className="text-stone-500 mt-2">Performance financeira e comercial em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Faturamento Mensal', value: 'R$ 128.500', trend: '+12%', icon: <Icons.Dollar />, color: 'bg-stone-900 text-white' },
          { label: 'Projetos Ativos', value: '8', trend: 'Estável', icon: <Icons.Folder />, color: 'bg-white text-stone-900 border border-stone-100' },
          { label: 'Leads Qualificados', value: '14', trend: '+5 novos', icon: <Icons.Briefcase />, color: 'bg-white text-stone-900 border border-stone-100' },
          { label: 'Taxa de Conversão', value: '22%', trend: '+4.5%', icon: <Icons.Chart />, color: 'bg-stone-100 text-stone-900' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 group`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-full bg-current opacity-10">{stat.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 bg-white/10 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <h3 className="text-3xl font-bold mb-1 tracking-tight">{stat.value}</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-96">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col">
          <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-3">
            <Icons.Chart /> Receita vs. Despesas
          </h3>
          <div className="flex-1 flex items-end gap-4 px-4 pb-4 border-b border-stone-100 relative">
            {[65, 40, 75, 55, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 group relative h-full flex items-end">
                <div 
                  className="w-full bg-stone-900 rounded-t-xl transition-all duration-1000 group-hover:bg-stone-700 relative overflow-hidden" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div 
                  className="w-full bg-stone-200 rounded-t-xl absolute bottom-0 -z-10 mx-2" 
                  style={{ height: `${h * 0.6}%`, width: 'calc(100% - 16px)' }}
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-black text-stone-400 uppercase tracking-widest">
            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
          </div>
        </div>

        <div className="bg-[#0C0C0C] p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stone-800/30 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-1000 group-hover:bg-stone-700/30"></div>
          <h3 className="text-lg font-bold mb-2 relative z-10">Meta Trimestral</h3>
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <div className="text-5xl font-bold mb-2">78%</div>
            <p className="text-sm text-stone-400 font-medium">R$ 350k / R$ 450k</p>
            <div className="w-full bg-stone-800 h-3 rounded-full mt-6 overflow-hidden">
              <div className="bg-white h-full w-[78%] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
            </div>
          </div>
          <button className="mt-auto w-full py-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all relative z-10 backdrop-blur-sm">
            Ver Relatório
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
