import { GoogleGenAI, Type } from "@google/genai";

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyAJh4Y1EYYwpVmXz4KWRCMGlWjir567hdo" });
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: `Analise o seguinte briefing de arquitetura/design e forneça 3 sugestões de estilo, uma lista de materiais recomendados e um resumo do perfil do cliente. Briefing: ${briefing}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              styles: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 sugestões de estilo de design"
              },
              materials: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de materiais recomendados"
              },
              profileSummary: {
                type: Type.STRING,
                description: "Resumo do perfil do cliente"
              }
            },
            required: ["styles", "materials", "profileSummary"]
          }
        }
      });
      return JSON.parse(response.text() || '{}');
    } catch (error) {
      console.error("Erro AI Briefing:", error);
      throw error;
    }
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Escreva uma mensagem de WhatsApp para o cliente ${leadName} que está no estágio "${status}". 
      O tom deve ser EXTREMAMENTE persuasivo, elegante e "agressivo" no sentido de exclusividade e urgência velada. 
      Foque na transformação de vida e no valor emocional do projeto. Estilo: Proximidade e Autoridade.`,
    });
    return response.text();
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Você é um arquiteto renomado com alto poder de fechamento. 
      Gere uma estrutura de proposta comercial persuasiva para ${leadName} baseada nas seguintes notas: "${notes}".
      ${budget ? `O investimento estimado discutido foi de R$ ${budget.toLocaleString('pt-BR')}.` : ''}
      
      A proposta deve seguir este roteiro:
      1. O SONHO: Validação emocional.
      2. O DIAGNÓSTICO: Problemas técnicos e estéticos.
      3. A SOLUÇÃO EXCLUSIVA: Sua abordagem única.
      4. ETAPAS DA JORNADA: Processo de trabalho.
      5. O PRÓXIMO PASSO: CTA forte.`,
    });
    return response.text();
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Você é um consultor técnico de arquitetura e urbanismo. 
      Baseado no texto normativo fornecido abaixo, responda à seguinte dúvida: "${query}"
      
      Texto Normativo/Plano Diretor:
      ${context}
      
      Responda de forma técnica, citando possíveis artigos ou diretrizes mencionados no texto. Seja direto e preciso.`,
    });
    return response.text();
  },

  async generateMoodboard(prompt: string) {
    return null; 
  }
};
