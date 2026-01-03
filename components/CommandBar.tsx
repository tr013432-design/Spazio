import React, { useState, useEffect } from 'react';

// Se não tiver ícones instalados, usamos SVGs inline
const Icons = {
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
  User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  Dollar: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Home: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
};

interface CommandBarProps {
  onNavigate: (page: string) => void;
  onAction: (action: string) => void;
}

const CommandBar: React.FC<CommandBarProps> = ({ onNavigate, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Atalho de Teclado (Cmd+K ou Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Comandos Disponíveis
  const commands = [
    { id: 'nav-dashboard', label: 'Ir para Dashboard', type: 'NAVIGATION', icon: <Icons.Home />, action: () => onNavigate('dashboard') },
    { id: 'nav-crm', label: 'Ir para CRM / Vendas', type: 'NAVIGATION', icon: <Icons.User />, action: () => onNavigate('crm') },
    { id: 'nav-projects', label: 'Ir para Projetos', type: 'NAVIGATION', icon: <Icons.Home />, action: () => onNavigate('projects') },
    { id: 'nav-finance', label: 'Ir para Financeiro', type: 'NAVIGATION', icon: <Icons.Dollar />, action: () => onNavigate('finance') },
    { id: 'act-lead', label: 'Novo Lead', type: 'ACTION', icon: <Icons.Plus />, action: () => onAction('new-lead') },
    { id: 'act-project', label: 'Novo Projeto', type: 'ACTION', icon: <Icons.Plus />, action: () => onAction('new-project') },
    { id: 'act-invoice', label: 'Lançar Receita/Despesa', type: 'ACTION', icon: <Icons.Plus />, action: () => onAction('new-transaction') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (index: number) => {
    const command = filteredCommands[index];
    if (command) {
      command.action();
      setIsOpen(false);
    }
  };

  // Navegação com setas
  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}></div>
      
      {/* Janela de Comando */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp ring-1 ring-stone-900/5">
        
        {/* Input */}
        <div className="flex items-center border-b border-stone-100 px-4 py-4">
          <div className="text-stone-400 mr-3"><Icons.Search /></div>
          <input 
            autoFocus
            className="w-full text-lg bg-transparent outline-none text-stone-800 placeholder:text-stone-300 font-medium"
            placeholder="O que você precisa fazer?"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDownInput}
          />
          <div className="hidden md:flex items-center gap-1">
             <kbd className="px-2 py-1 bg-stone-100 rounded text-[10px] font-bold text-stone-500 border border-stone-200">ESC</kbd>
          </div>
        </div>

        {/* Lista de Resultados */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {filteredCommands.length > 0 ? (
            <>
              <div className="px-4 py-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">Sugestões</div>
              {filteredCommands.map((cmd, index) => (
                <div 
                  key={cmd.id}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 mx-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${index === selectedIndex ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white shadow-sm' : 'bg-stone-100'}`}>
                       {cmd.icon}
                    </div>
                    <span className="font-bold text-sm">{cmd.label}</span>
                  </div>
                  {index === selectedIndex && (
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Enter</span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="px-8 py-12 text-center text-stone-400">
               <p className="font-serif italic">Nenhum comando encontrado...</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-stone-50 px-4 py-2 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400 font-medium">
           <span><strong>Pro Tip:</strong> Use as setas para navegar</span>
           <span>ArchiFlow OS v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default CommandBar;
