import React, { useState } from 'react';
import Layout from './components/MainLayout';
import Dashboard from './components/Dashboard';
// import CRM from './components/CRM';       <-- Desligado temporariamente
// import Finance from './components/Finance'; <-- Desligado temporariamente
// import Projects from './components/Projects'; <-- Desligado temporariamente

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      // case 'crm': return <CRM />;
      // case 'projects': return <Projects />;
      // case 'finance': return <Finance />;
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
