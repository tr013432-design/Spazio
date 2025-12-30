
import React, { useState } from 'react';
import { Transaction } from '../types';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const initialTransactions: Transaction[] = [
  { id: '1', type: 'INCOME', category: 'Projeto', amount: 8500, date: '2023-11-01', description: 'Primeira parcela - Apt Ipanema', status: 'PAID' },
  { id: '2', type: 'EXPENSE', category: 'Marketing', amount: 500, date: '2023-11-02', description: 'Anúncios Instagram', status: 'PAID' },
  { id: '3', type: 'EXPENSE', category: 'Software', amount: 250, date: '2023-11-05', description: 'Assinatura ArchiFlow', status: 'PENDING' },
  { id: '4', type: 'INCOME', category: 'Consultoria', amount: 1200, date: '2023-11-10', description: 'Visita técnica obra Ricardo', status: 'PAID' },
];

const projectionData = [
  { name: 'Set', previsto: 12000, realizado: 11000, custo: 4000 },
  { name: 'Out', previsto: 15000, realizado: 14500, custo: 4500 },
  { name: 'Nov', previsto: 22000, realizado: 12800, custo: 5000 },
  { name: 'Dez', previsto: 18000, realizado: 0, custo: 4800 },
  { name: 'Jan', previsto: 25000, realizado: 0, custo: 5200 },
];

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: 'Projeto',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const pendingExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      status: 'PAID' // Transações manuais entram como liquidadas por padrão
    };
    setTransactions([newTransaction, ...transactions]);
    setIsModalOpen(false);
    setFormData({
      description: '',
      type: 'INCOME',
      category: 'Projeto',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>
          </div>
          <p className="text-[10px] uppercase font-black text-stone-500 mb-1 tracking-[0.2em]">Saldo em Caixa (Real)</p>
          <h2 className="text-4xl font-bold font-serif">R$ {totalIncome.toLocaleString('pt-BR')}</h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold">Conciliado</span>
          </div>
        </div>
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm">
          <p className="text-[10px] uppercase font-black text-stone-400 mb-1 tracking-[0.2em]">Receita a Receber (Projetos)</p>
          <h2 className="text-3xl font-bold text-stone-800">R$ 35.250</h2>
          <p className="text-xs text-stone-400 mt-2 font-medium">Saldo total de contratos ativos</p>
        </div>
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm">
          <p className="text-[10px] uppercase font-black text-stone-400 mb-1 tracking-[0.2em]">Contas a Pagar</p>
          <h2 className="text-3xl font-bold text-red-500">R$ {pendingExpense.toLocaleString('pt-BR')}</h2>
          <p className="text-xs text-stone-400 mt-2 font-medium">Vencimentos próximos: 1</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[32px] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h4 className="text-xl font-bold text-stone-800 font-serif">Saúde Financeira Studio</h4>
            <p className="text-sm text-stone-500">Fluxo de caixa comparativo entre metas e realidade.</p>
          </div>
          <div className="flex gap-3">
             <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
               <div className="w-3 h-3 bg-stone-900 rounded-sm"></div>
               <span className="text-[10px] font-black uppercase text-stone-500">Realizado</span>
             </div>
             <div className="flex items-center gap-2 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
               <div className="w-3 h-0.5 bg-stone-400"></div>
               <span className="text-[10px] font-black uppercase text-stone-500">Previsto</span>
             </div>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#a8a29e'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#fafaf9' }}
              />
              <Bar dataKey="realizado" barSize={40} fill="#1c1917" radius={[12, 12, 0, 0]} />
              <Line type="monotone" dataKey="previsto" stroke="#a8a29e" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#a8a29e' }} />
              <Line type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <h4 className="text-xl font-bold text-stone-800 font-serif">Conciliação Bancária</h4>
          <div className="flex gap-2">
             <button 
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95"
              >
                Nova Entrada/Saída
              </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Data</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Descrição</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Categoria</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/30 transition-colors">
                  <td className="px-8 py-6 text-sm text-stone-500 font-medium">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-6 text-sm font-bold text-stone-800">{t.description}</td>
                  <td className="px-8 py-6">
                    <span className="text-[9px] font-black text-stone-500 bg-stone-100 px-3 py-1 rounded-full uppercase tracking-tighter">
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-sm font-black ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'PAID' ? 'bg-green-500' : 'bg-amber-400'}`}></div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${t.status === 'PAID' ? 'text-stone-700' : 'text-stone-400'}`}>
                         {t.status === 'PAID' ? 'Liquidado' : 'Pendente'}
                       </span>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border border-stone-100">
            <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <div>
                <h4 className="text-3xl font-bold text-stone-800 font-serif">Lançamento de Caixa</h4>
                <p className="text-xs text-stone-400 mt-2 uppercase font-black tracking-[0.3em]">Governança Financeira Studio</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-3 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descrição</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" placeholder="Ex: Pagamento Fornecedor Marcenaria" />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as 'INCOME' | 'EXPENSE'})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 transition-all font-bold">
                    <option value="INCOME">Receita (+)</option>
                    <option value="EXPENSE">Despesa (-)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 transition-all font-bold">
                    <option>Projeto</option>
                    <option>Consultoria</option>
                    <option>Software</option>
                    <option>Marketing</option>
                    <option>Impostos</option>
                    <option>Outros</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Data</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full py-6 bg-stone-900 text-white font-black text-[13px] uppercase tracking-[0.3em] rounded-2xl hover:bg-stone-800 transition-all shadow-2xl mt-6 active:scale-95">Confirmar Lançamento</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
