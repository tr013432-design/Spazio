import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold text-black mb-4">O Sistema Está Vivo!</h2>
      <p className="text-gray-600">Se você está lendo isso, o erro da tela branca foi resolvido.</p>
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
        <p className="font-bold text-green-800">Status: OPERACIONAL</p>
      </div>
    </div>
  );
};

export default Dashboard;
