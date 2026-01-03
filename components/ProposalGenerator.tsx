import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print'; // Se não tiver, usaremos window.print nativo no botão

// Ícones Inline
const Icons = {
  Printer: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>,
  Check: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>,
  Logo: () => (
    <div className="flex flex-col items-center">
      <div className="text-3xl font-serif font-black tracking-tighter text-stone-900">ARCHI<span className="text-stone-400">FLOW</span></div>
      <div className="text-[8px] font-black uppercase tracking-[0.4em] text-stone-500">Elite Management</div>
    </div>
  )
};

interface LeadData {
  name: string;
  email: string;
  budget: number;
  notes: string;
  address?: string; // Adicionado para endereço da obra
}

interface ProposalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: LeadData;
}

const ProposalGenerator: React.FC<ProposalProps> = ({ isOpen, onClose, lead }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    setIsGenerating(true);
    // Simulação de delay para "processamento"
    setTimeout(() => {
      const printContent = printRef.current;
      const windowUrl = 'about:blank';
      const uniqueName = new Date();
      const windowName = 'Print' + uniqueName.getTime();
      const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

      if (printWindow && printContent) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Proposta - ${lead.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Manrope:wght@400;700;800&display=swap');
                body { font-family: 'Manrope', sans-serif; -webkit-print-color-adjust: exact; }
                .font-serif { font-family: 'Playfair Display', serif; }
              </style>
            </head>
            <body class="bg-white">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsGenerating(false);
        }, 500);
      }
    }, 800);
  };

  if (!isOpen) return null;

  // Calculadora simples de parcelamento para a proposta
  const entryValue = lead.budget * 0.30;
  const installmentValue = (lead.budget * 0.70) / 4;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm animate-fadeIn">
      
      {/* Container Principal */}
      <div className="bg-stone-100 w-full max-w-5xl h-[90vh] rounded-[32px] overflow-hidden flex shadow-2xl relative">
        
        {/* Lado Esquerdo - Controles */}
        <div className="w-1/3 p-8 border-r border-stone-200 flex flex-col bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-bold font-serif text-stone-900">Gerador de Proposta</h3>
            <p className="text-xs text-stone-500 mt-2 font-medium">O documento será gerado com base nos dados do CRM.</p>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
              <p className="text-[10px] uppercase font-black text-stone-400 mb-1">Cliente</p>
              <p className="font-bold text-stone-800">{lead.name}</p>
            </div>
            
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
               <p className="text-[10px] uppercase font-black text-stone-400 mb-1">Escopo (Baseado em Notas)</p>
               <p className="text-xs text-stone-600 italic line-clamp-4">"{lead.notes || 'Projeto de arquitetura e interiores completo...'}"</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
               <p className="text-[10px] uppercase font-black text-stone-400 mb-1">Valor Total</p>
               <p className="text-xl font-serif font-bold text-stone-900">R$ {lead.budget.toLocaleString('pt-BR')}</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
               <div className="flex gap-2 items-start">
                 <div className="mt-0.5 text-amber-500"><Icons.Check /></div>
                 <div>
                   <p className="text-xs font-bold text-amber-800">Identidade Visual Aplicada</p>
                   <p className="text-[10px] text-amber-600 mt-1">Logo, fontes e cores do ArchiFlow já configuradas.</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            <button 
              onClick={handlePrint}
              disabled={isGenerating}
              className="w-full py-4 bg-stone-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-70"
            >
              {isGenerating ? (
                <span className="animate-pulse">Processando PDF...</span>
              ) : (
                <>
                  <Icons.Printer /> Imprimir / Salvar PDF
                </>
              )}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-white border-2 border-stone-100 text-stone-500 rounded-xl text-xs font-black uppercase tracking-widest hover:border-stone-900 hover:text-stone-900 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Lado Direito - PREVIEW DO PAPEL (A4) */}
        <div className="w-2/3 bg-stone-200/50 p-8 overflow-y-auto flex justify-center items-start">
          
          {/* FOLHA A4 - Proporção exata para impressão */}
          <div ref={printRef} className="bg-white w-[210mm] min-h-[297mm] p-[15mm] shadow-2xl mx-auto relative text-stone-800">
            
            {/* CABEÇALHO */}
            <header className="flex justify-between items-center border-b-2 border-stone-900 pb-8 mb-12">
               <Icons.Logo />
               <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Proposta Comercial</p>
                 <p className="text-sm font-bold text-stone-900 mt-1">#{new Date().getFullYear()}-{Math.floor(Math.random()*1000)}</p>
                 <p className="text-xs text-stone-500">{new Date().toLocaleDateString('pt-BR')}</p>
               </div>
            </header>

            {/* CORPO DA PROPOSTA */}
            <main className="space-y-10">
              
              {/* Apresentação */}
              <section>
                <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 leading-tight">Projeto de Arquitetura<br/>& Interiores</h1>
                <p className="text-lg text-stone-500 font-medium">Preparado exclusivamente para <span className="text-stone-900 font-bold">{lead.name}</span></p>
              </section>

              {/* O Desafio (Baseado nas notas do CRM) */}
              <section className="bg-stone-50 p-8 border-l-4 border-stone-900">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-4">Briefing & Escopo</h3>
                <p className="font-serif italic text-stone-700 text-lg leading-relaxed">
                  "{lead.notes || 'Desenvolvimento de projeto arquitetônico completo, visando a otimização dos espaços, conforto térmico e acústico, e uma estética atemporal que reflita a personalidade dos moradores.'}"
                </p>
                {lead.address && <p className="mt-4 text-xs font-bold text-stone-500 uppercase tracking-wider">Local: {lead.address}</p>}
              </section>

              {/* Metodologia */}
              <section className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-4 border-b border-stone-100 pb-2">Entregáveis</h3>
                  <ul className="space-y-2 text-sm text-stone-600 font-medium">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span> Levantamento Métrico</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span> Estudo Preliminar (3D)</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span> Anteprojeto Técnico</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span> Detalhamento Executivo</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span> RRT de Projeto</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-900 mb-4 border-b border-stone-100 pb-2">Cronograma Estimado</h3>
                  <ul className="space-y-2 text-sm text-stone-600 font-medium">
                    <li className="flex justify-between"><span>Briefing & Layout</span> <span className="font-bold">15 dias</span></li>
                    <li className="flex justify-between"><span>Apresentação 3D</span> <span className="font-bold">20 dias</span></li>
                    <li className="flex justify-between"><span>Executivo Final</span> <span className="font-bold">25 dias</span></li>
                  </ul>
                </div>
              </section>

              {/* Investimento */}
              <section className="mt-12 pt-8 border-t-2 border-stone-100">
                 <div className="flex justify-between items-end mb-8">
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900">Investimento Total</h3>
                       <p className="text-xs text-stone-500 mt-1">Honorários de projeto e responsabilidade técnica</p>
                    </div>
                    <div className="text-5xl font-serif font-bold text-stone-900">
                      R$ {lead.budget.toLocaleString('pt-BR')}
                    </div>
                 </div>

                 <div className="bg-stone-900 text-stone-100 p-8 rounded-xl flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Forma de Pagamento Sugerida</p>
                      <div className="space-y-1 text-sm font-medium">
                        <p>• Entrada (30%): R$ {entryValue.toLocaleString('pt-BR')}</p>
                        <p>• + 4 parcelas mensais de: R$ {installmentValue.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="w-24 h-24 bg-white p-2 rounded-lg ml-auto mb-2">
                         {/* Placeholder de QR Code fingido */}
                         <div className="w-full h-full border-4 border-stone-900 border-dashed flex items-center justify-center text-[8px] font-black text-stone-900 text-center uppercase">
                           Assinar Digitalmente
                         </div>
                       </div>
                       <p className="text-[9px] uppercase tracking-widest text-stone-400">Validade: 7 dias</p>
                    </div>
                 </div>
              </section>
            </main>

            {/* RODAPÉ */}
            <footer className="absolute bottom-[15mm] left-[15mm] right-[15mm] border-t border-stone-200 pt-6 flex justify-between items-center text-xs text-stone-400">
               <p>ArchiFlow Elite Management © {new Date().getFullYear()}</p>
               <p>archiflow.app</p>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalGenerator;
