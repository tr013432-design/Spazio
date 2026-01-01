import React, { useState } from 'react';
import { Icons } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'dashboard', label: 'Início', icon: <Icons.Dashboard /> },
    { id: 'crm', label: 'CRM', icon: <Icons.Briefcase /> },
    { id: 'projects', label: 'Projetos', icon: <Icons.Folder /> },
    { id: 'finance', label: 'Financeiro', icon: <Icons.Dollar /> },
    // REMOVIDO: Item da IA Workspace para evitar erros
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex font-sans text-stone-800">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-[#0C0C0C] text-white transition-all duration-500 ease-out flex flex-col fixed h-full z-50 shadow-2xl`}
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0">
             <div className="w-6 h-6 border-4 border-[#0C0C0C] border-t-transparent rounded-full"></div>
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold tracking-tighter leading-none">ARCHI<span className="font-light text-stone-400">FLOW</span></h1>
              <p className="text-[9px] text-stone-500 tracking-[0.2em] font-bold mt-1">ELITE MANAGEMENT</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden
                ${activeTab === item.id 
                  ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] translate-x-2' 
                  : 'text-stone-400 hover:bg-stone-900 hover:text-white'}`}
            >
              <span className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              
              {isSidebarOpen && (
                <span className={`text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-500 ${activeTab === item.id ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
              )}

              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-black rounded-r-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className={`bg-stone-900 rounded-3xl p-4 flex items-center gap-4 transition-all duration-500 ${!isSidebarOpen && 'justify-center p-2'}`}>
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center font-bold text-xs border border-stone-700">JS</div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">Julia Soares</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest truncate">Senior Partner</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-500 ease-out ${isSidebarOpen ? 'ml-72' : 'ml-24'} p-8 md:p-12 min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
