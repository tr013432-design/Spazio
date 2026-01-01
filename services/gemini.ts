// ARQUIVO NEUTRO DE SEGURANÇA
// Garante que o CRM carregue mesmo sem IA.
export const geminiService = {
  async analyzeBriefing() { return {}; },
  async generateFollowUpMessage() { return "IA Desativada."; },
  async generateProposal() { return "IA Desativada."; },
  async analyzeRegulatoryDocs() { return "IA Desativada."; },
  async generateMoodboard() { return null; }
};
