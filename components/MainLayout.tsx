import React from 'react';

// Layout Simplificado - Sem Ícones, Sem Lógica Complexa
const Layout = ({ children, activeTab, setActiveTab }: any) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      <header className="bg-black text-white p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ARCHIFLOW - MODO SEGURANÇA</h1>
        <nav className="flex gap-4 text-sm font-bold">
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-gray-300">DASHBOARD</button>
          <button onClick={() => setActiveTab('crm')} className="hover:text-gray-300">CRM</button>
        </nav>
      </header>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
