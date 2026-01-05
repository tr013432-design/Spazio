import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { sendMobileNotification } from '../services/notificationService'; // <--- Importação do Serviço

// --- 1. ÍCONES INLINE ---
const Icons = {
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  Upload: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>,
  TrendingUp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
};

// --- 2. TIPOS E DADOS ---
interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  status: 'PAID' | 'PENDING';
}

const initialTransactions: Transaction[] = [
  { id: '1', type: 'INCOME', category: 'Projeto', amount: 8500, date: '2023-11-01', description: 'Primeira parcela - Apt Ipanema', status: 'PAID' },
  { id: '2', type: 'EXPENSE', category: 'Marketing', amount: 1500, date: '2023-11-02', description: 'Anúncios Instagram Ads', status: 'PAID' },
  { id: '3', type: 'EXPENSE', category: 'Software', amount: 250, date: '2023-11-05', description: 'Assinatura ArchiFlow', status: 'PENDING' },
  { id: '4', type: 'INCOME', category: 'Consultoria', amount: 1200, date: '2023-11-10', description: 'Visita técnica obra Ricardo', status: 'PAID' },
  { id: '5', type: 'EXPENSE', category: 'Impostos', amount: 890, date: '2023-11-15', description: 'DAS Simples Nacional', status: 'PENDING' },
  { id: '6', type: 'EXPENSE', category: 'Escritório', amount: 400, date: '2023-11-20', description: 'Material de Limpeza/Copa', status: 'PAID' },
];

const projectionData = [
  { name: 'Set', previsto: 12000, realizado: 11000, custo: 4000 },
  { name: 'Out', previsto: 15000, realizado: 14500, custo: 4500 },
  { name: 'Nov', previsto: 22000, realizado: 12800, custo: 5000 }, // Mês atual
  { name: 'Dez', previsto: 18000, realizado: 0, custo: 4800 },
  { name: 'Jan', previsto: 25000, realizado: 0, custo: 5200 },
];

const COLORS = ['#1c1917', '#57534e', '#a8a29e', '#ef4444', '#f59e0b'];

// --- 3. COMPONENTE PRINCIPAL ---
const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'CASH' | 'ACCRUAL'>('CASH'); // Caixa vs Competência
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    description: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    category: 'Projeto',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Cálculos de Totais
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const pendingExpense = transactions
    .filter(t => t.type === 'EXPENSE' && t.status === 'PENDING')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Dados para o Gráfico de Pizza (Despesas por Categoria)
  const expensePieData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const grouped = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(grouped).map(key => ({ name: key, value: grouped[key] }));
  }, [transactions]);

  // Handler de Criação
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
      description: formData.description,
      status: 'PAID'
    };
    setTransactions([newTransaction, ...transactions]);
    
    // --- NOTIFICAÇÃO MOBILE ---
    if (newTransaction.type === 'INCOME') {
       sendMobileNotification(
          "Dinheiro no Caixa! 💰",
          `Entrada de R$ ${newTransaction.amount.toLocaleString('pt-BR')}\nRef: ${newTransaction.description}`
       );
    } else {
       sendMobileNotification(
          "Nova Despesa Lançada 📉",
          `Saída de R$ ${newTransaction.amount.toLocaleString('pt-BR')}\nCat: ${newTransaction.category}`
       );
    }
    // -------------------------

    setIsModalOpen(false);
    setFormData({ description: '', type: 'INCOME', category: 'Projeto', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      
      {/* --- CARDS SUPERIORES (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Principal - Saldo */}
        <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path></svg>
          </div>
          <p className="text-[10px] uppercase font-black text-stone-500 mb-1 tracking-[0.2em]">Fluxo de Caixa Livre</p>
          <h2 className="text-4xl font-bold font-serif">R$ {totalIncome.toLocaleString('pt-BR')}</h2>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <Icons.TrendingUp /> +12% este mês
            </span>
          </div>
        </div>

        {/* Card Recebíveis */}
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <p className="text-[10px] uppercase font-black text-stone-400 mb-1 tracking-[0.2em]">Provisão de Receita</p>
          <h2 className="text-3xl font-bold text-stone-800">R$ 35.250</h2>
          <div className="w-full bg-stone-100 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-stone-800 h-full w-2/3"></div>
          </div>
          <p className="text-xs text-stone-400 mt-2 font-medium">65% dos contratos já empenhados</p>
        </div>

        {/* Card A Pagar */}
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all">
          <p className="text-[10px] uppercase font-black text-stone-400 mb-1 tracking-[0.2em]">Compromissos Futuros</p>
          <h2 className="text-3xl font-bold text-red-500">R$ {pendingExpense.toLocaleString('pt-BR')}</h2>
          <p className="text-xs text-stone-400 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            1 boleto vence hoje
          </p>
        </div>
      </div>

      {/* --- SEÇÃO DE GRÁFICOS (GRID 2/3 + 1/3) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO PRINCIPAL (Fluxo de Caixa) */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-[32px] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h4 className="text-xl font-bold text-stone-800 font-serif">Inteligência Financeira</h4>
              <p className="text-xs text-stone-500 mt-1">Análise comparativa de performance.</p>
            </div>
            
            {/* SELETOR CAIXA VS COMPETÊNCIA */}
            <div className="bg-stone-100 p-1 rounded-xl flex">
               <button 
                 onClick={() => setViewMode('CASH')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'CASH' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
               >
                 Caixa (Real)
               </button>
               <button 
                 onClick={() => setViewMode('ACCRUAL')}
                 className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'ACCRUAL' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
               >
                 Competência
               </button>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{fill: '#a8a29e'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#fafaf9' }}
                />
                <Bar dataKey="realizado" barSize={32} fill="#1c1917" radius={[6, 6, 0, 0]} />
                {/* Mostra linha de previsão apenas se estiver no modo Competência ou se quiser comparar */}
                <Line type="monotone" dataKey="previsto" stroke="#a8a29e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#a8a29e' }} />
                <Line type="monotone" dataKey="custo" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO DE PIZZA (Breakdown de Despesas) */}
        
        <div className="bg-white border border-stone-200 rounded-[32px] p-8 shadow-sm flex flex-col">
          <h4 className="text-sm font-bold text-stone-800 font-serif mb-6">Custos por Categoria</h4>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => <span className="text-[10px] font-bold text-stone-500 uppercase ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
             <p className="text-[10px] text-stone-400 font-medium">Maior ofensor: <span className="text-stone-800 font-bold">Marketing (45%)</span></p>
          </div>
        </div>
      </div>

      {/* --- TABELA DE TRANSAÇÕES --- */}
      <div className="bg-white border border-stone-200 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-8 border-b border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
             <h4 className="text-xl font-bold text-stone-800 font-serif">Livro Caixa Digital</h4>
             <p className="text-xs text-stone-500 mt-1">Conciliação de entradas e saídas.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             {/* BOTÃO IMPORTAR OFX (Simulado) */}
             <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-stone-200 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-stone-900 hover:text-stone-900 transition-all">
                <Icons.Upload /> Importar OFX
             </button>
             
             <button 
               onClick={() => setIsModalOpen(true)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-stone-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg active:scale-95"
             >
               <Icons.Plus /> Lançar
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
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Valor</th>
                <th className="px-8 py-5 text-[10px] font-black text-stone-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-5 text-xs text-stone-500 font-bold font-mono">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-5 text-sm font-bold text-stone-800">{t.description}</td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-stone-500 bg-stone-100 px-3 py-1.5 rounded-lg uppercase tracking-wider border border-stone-200 group-hover:bg-white transition-colors">
                      {t.category}
                    </span>
                  </td>
                  <td className={`px-8 py-5 text-sm font-black text-right ${t.type === 'INCOME' ? 'text-stone-800' : 'text-red-500'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-8 py-5 text-center">
                    {t.status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 uppercase tracking-widest">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Liquidado
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Pendente
                        </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL DE LANÇAMENTO --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border border-stone-100">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h4 className="text-2xl font-bold text-stone-800 font-serif">Novo Movimento</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors font-bold text-xl">✕</button>
            </div>
            <form onSubmit={handleCreateTransaction} className="p-8 space-y-6">
              
              <div className="flex bg-stone-100 p-1 rounded-xl">
                 <button 
                   type="button" 
                   onClick={() => setFormData({...formData, type: 'INCOME'})}
                   className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'INCOME' ? 'bg-green-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
                 >
                   Entrada
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                   className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.type === 'EXPENSE' ? 'bg-red-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
                 >
                   Saída
                 </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Descrição</label>
                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-all font-bold text-stone-800" placeholder="Ex: Pagamento Fornecedor" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Valor (R$)</label>
                   <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-all font-bold text-stone-800" placeholder="0.00" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Categoria</label>
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-all font-bold text-stone-800">
                     <option>Projeto</option>
                     <option>Marketing</option>
                     <option>Software</option>
                     <option>Impostos</option>
                     <option>Escritório</option>
                     <option>Consultoria</option>
                   </select>
                </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Data de Competência</label>
                 <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-all font-bold text-stone-800" />
              </div>

              <button type="submit" className="w-full py-4 bg-stone-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-stone-800 transition-all shadow-xl active:scale-95 mt-4">
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
