import React, { useState } from 'react';
import Layout from './components/MainLayout';
import Dashboard from './components/Dashboard';
import CRM from './components/CRM';
import Finance from './components/Finance';
import Projects from './components/Projects';
// A importação do AIWorkspace foi removida

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'crm': return <CRM />;
      case 'projects': return <Projects />;
      case 'finance': return <Finance />;
      // Caso 'ai' removido para evitar erros
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
