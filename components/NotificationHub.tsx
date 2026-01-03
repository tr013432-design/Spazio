import React, { useState } from 'react';

const Icons = {
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>,
  Check: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  Alert: () => <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
  Money: () => <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  User: () => <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
};

// Dados Mockados de Notificações
const initialNotifications = [
  { id: 1, type: 'ALERT', title: 'Atraso Crítico', message: 'Entrega de Marcenaria (Apt Ipanema) está atrasada há 2 dias.', time: '10 min atrás', read: false },
  { id: 2, type: 'MONEY', title: 'Pagamento Recebido', message: 'Pix de R$ 8.500 confirmado - Cliente Ricardo M.', time: '2h atrás', read: false },
  { id: 3, type: 'LEAD', title: 'Novo Lead Quente', message: 'Marcos Vinicius visualizou sua proposta 3x hoje.', time: '5h atrás', read: true },
  { id: 4, type: 'SYSTEM', title: 'RRT Emitida', message: 'Documento RRT-9988 gerado com sucesso.', time: '1d atrás', read: true },
];

const NotificationHub: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ALERT': return <Icons.Alert />;
      case 'MONEY': return <Icons.Money />;
      case 'LEAD': return <Icons.User />;
      default: return <div className="w-2 h-2 bg-stone-400 rounded-full"></div>;
    }
  };

  return (
    <div className="relative">
      {/* Botão do Sino */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100"
      >
        <Icons.Bell />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {/* Painel Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 z-50 overflow-hidden animate-slideUp origin-top-right">
            
            <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h4 className="text-xs font-black uppercase tracking-widest text-stone-500">Notificações</h4>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-[10px] font-bold text-stone-400 hover:text-stone-900 transition-colors">
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 border-b border-stone-50 hover:bg-stone-50 transition-all cursor-pointer flex gap-4 ${!notif.read ? 'bg-stone-50/30' : 'opacity-60'}`}
                  >
                    <div className={`mt-1 p-2 rounded-xl h-fit ${!notif.read ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-bold ${!notif.read ? 'text-stone-900' : 'text-stone-600'}`}>{notif.title}</p>
                        {!notif.read && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{notif.message}</p>
                      <p className="text-[9px] font-black text-stone-300 uppercase mt-2">{notif.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-stone-400 text-xs">
                  Tudo tranquilo por aqui.
                </div>
              )}
            </div>

            <div className="p-3 bg-stone-50 text-center border-t border-stone-100">
              <button className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-900">
                Ver Histórico Completo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationHub;
