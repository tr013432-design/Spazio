import React, { useState } from 'react';
import Layout from './components/MainLayout';
import Dashboard from './components/Dashboard';
// Mantemos esses importados, mas não usamos no render por enquanto para testar
import CRM from './components/CRM';
import Finance from './components/Finance';
import Projects from './components/Projects';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    // SE O SITE ABRIR, SABEMOS QUE O DASHBOARD ESTÁ OK.
    // SE FICAR BRANCO AO CLICAR EM CRM, O ERRO É NO CRM.
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
      {renderContent()}
    </Layout>
  );
};

export default App;
