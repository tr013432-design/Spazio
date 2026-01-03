import React, { useState } from 'react';
import Layout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import CRM from './components/CRM';
import Finance from './components/Finance';
import Projects from './components/Projects';
import CommandBar from './components/CommandBar'; // <--- Importação da Barra Jarvis

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Função para lidar com as ações rápidas da CommandBar
  const handleCommandAction = (action: string) => {
    // Por enquanto, vamos redirecionar para a aba correta.
    // No futuro (com Context API), podemos fazer isso abrir o modal direto!
    switch (action) {
      case 'new-lead':
        setActiveTab('crm');
        break;
      case 'new-project':
        setActiveTab('projects');
        break;
      case 'new-transaction':
        setActiveTab('finance');
        break;
      default:
        console.log("Ação não mapeada:", action);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'projects': return <Projects />;
      case 'finance': return <Finance />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* A CommandBar fica aqui, invisível até você apertar Ctrl+K ou Cmd+K */}
      <CommandBar 
        onNavigate={(page) => setActiveTab(page)} 
        onAction={handleCommandAction} 
      />
      
      {renderContent()}
    </Layout>
  );
};

export default App;
