// ARQUIVO NEUTRO DE SEGURANÇA
// Isso impede que o site quebre por causa da IA.

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    return {
      styles: ["Clássico", "Moderno", "Industrial"],
      materials: ["Madeira", "Vidro", "Concreto"],
      profileSummary: "Funcionalidade de IA desativada temporariamente."
    };
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    return "O sistema de IA está desativado no momento. Prossiga manualmente.";
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    return "O sistema de IA está desativado no momento. Prossiga manualmente.";
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    return "IA Offline.";
  },

  async generateMoodboard(prompt: string) {
    return null; 
  }
};
