import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Função para limpar o JSON que o Gemini às vezes embrulha em Markdown
const cleanJSON = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const getAIModel = (modelName: string = "gemini-pro") => {
  if (!apiKey || !genAI) {
    console.error("ERRO CRÍTICO: Chave de API não configurada.");
    throw new Error("Chave de API ausente.");
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    try {
      // Usando o modelo clássico gemini-pro
      const model = getAIModel("gemini-pro");
      
      const prompt = `Analise o briefing abaixo e retorne APENAS um JSON válido (sem markdown) com as chaves: styles (array de strings), materials (array de strings) e profileSummary (string).
      
      Briefing: ${briefing}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      return JSON.parse(cleanJSON(text));
    } catch (error) {
      console.error("Erro no analyzeBriefing:", error);
      throw new Error("Falha ao analisar. Tente novamente.");
    }
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const model = getAIModel("gemini-pro");
    const result = await model.generateContent(`Escreva uma mensagem curta de WhatsApp para o cliente ${leadName} (status: ${status}). Tom persuasivo e elegante. Sem hashtags.`);
    return result.response.text();
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const model = getAIModel("gemini-pro"); 
    
    const result = await model.generateContent(`Você é um arquiteto sênior. Crie uma proposta comercial para ${leadName}. Notas: "${notes}". ${budget ? `Orçamento: R$ ${budget}` : ''}.
    Estruture em: 1. O Sonho, 2. Diagnóstico, 3. Solução, 4. Próximos Passos.`);
    
    return result.response.text();
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const model = getAIModel("gemini-pro");
    const result = await model.generateContent(`Atue como especialista em legislação urbana. Baseado no texto: "${context}", responda: "${query}". Seja técnico.`);
    return result.response.text();
  },

  async generateMoodboard(prompt: string) {
    try {
        const model = getAIModel("gemini-pro");
        const result = await model.generateContent(`Descreva visualmente um moodboard para: ${prompt}. Descreva cores e materiais.`);
        console.warn("Geração de imagem requer modelo Imagen (indisponível na chave padrão).");
        return null; 
    } catch (error) {
        return null;
    }
  }
};
