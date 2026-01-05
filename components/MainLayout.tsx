import React, { useState } from 'react';
import { Icons } from '../constants';
import NotificationHub from './NotificationHub'; // <--- Importação da Nova Central de Notificações

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: <Icons.Dashboard /> },
    { id: 'crm', label: 'CRM', icon: <Icons.Users /> },
    { id: 'projects', label: 'Projetos', icon: <Icons.Briefcase /> },
    { id: 'finance', label: 'Financeiro', icon: <Icons.Dollar /> },
  ];

  const togglePresentation = () => setIsPresentationMode(!isPresentationMode);

  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 font-sans">
      {/* Sidebar Desktop */}
      {!isPresentationMode && (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-950 text-stone-100 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex items-center justify-between">
            <div>
              {/* --- MUDANÇA DE NOME: SPAZIO ARQUITETURA --- */}
              <h1 className="text-xl font-bold tracking-tighter flex items-center gap-1 font-serif">
                SPAZIO<span className="text-stone-500 font-light">ARQUITETURA</span>
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone-600 mt-1 font-black">Elite Management</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-stone-500 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <nav className="flex-1 mt-4 px-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-stone-100 text-stone-900 shadow-[0_10px_20px_rgba(255,255,255,0.05)]'
                    : 'text-stone-500 hover:bg-stone-900 hover:text-stone-200'
                }`}
              >
                <span className={`${activeTab === item.id ? 'text-stone-900 scale-110' : 'text-stone-600 group-hover:text-stone-300'}`}>{item.icon}</span>
                <span className="font-bold text-[13px] uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-stone-900 bg-stone-950/50">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-stone-900/40">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-900 flex items-center justify-center font-bold shadow-inner">
                JS
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Julia Soares</p>
                <p className="text-[10px] text-stone-600 uppercase font-black">Senior Partner</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-500 ${isPresentationMode ? 'bg-white' : 'bg-stone-50'}`}>
        {/* Header */}
        {!isPresentationMode && (
          <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-stone-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold text-stone-800 font-serif lowercase">
                <span className="text-stone-300 mr-2 font-sans text-sm font-black uppercase tracking-widest">/</span>
                {activeTab}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={togglePresentation}
                title="Modo Apresentação"
                className="p-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-2xl transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </button>
              
              <div className="h-8 w-[1px] bg-stone-200 mx-2 hidden md:block"></div>
              
              {/* --- AQUI ENTRA A NOVA CENTRAL DE NOTIFICAÇÕES --- */}
              <NotificationHub /> 
              
            </div>
          </header>
        )}

        {/* Floating Presentation Control */}
        {isPresentationMode && (
          <button 
            onClick={togglePresentation}
            className="fixed bottom-10 right-10 z-[100] bg-stone-900 text-white px-8 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            Sair da Apresentação
          </button>
        )}

        {/* Dynamic Content */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar ${isPresentationMode ? 'p-0' : 'p-4 md:p-10'}`}>
          {children}
        </div>

        {/* Bottom Navigation Mobile */}
        {!isPresentationMode && (
          <nav className="lg:hidden h-20 bg-white border-t border-stone-200 px-6 flex items-center justify-between sticky bottom-0 z-40 shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTab === item.id ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-stone-900 text-white scale-110 shadow-lg' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        )}
      </main>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}
    </div>
  );
};

export default Layout;
