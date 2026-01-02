import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Função auxiliar para pegar a instância da IA com segurança
const getAIModel = (modelName: string = "gemini-1.5-flash") => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("ERRO CRÍTICO: VITE_GEMINI_API_KEY não encontrada no .env");
    throw new Error("Chave de API não configurada");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const model = getAIModel("gemini-1.5-flash");
    
    const prompt = `Analise o seguinte briefing de arquitetura/design e forneça 3 sugestões de estilo, uma lista de materiais recomendados e um resumo do perfil do cliente. Briefing: ${briefing}`;

    const schema = {
      type: SchemaType.OBJECT,
      properties: {
        styles: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "3 sugestões de estilo de design"
        },
        materials: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Lista de materiais recomendados"
        },
        profileSummary: {
          type: SchemaType.STRING,
          description: "Resumo do perfil do cliente"
        }
      },
      required: ["styles", "materials", "profileSummary"]
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    return JSON.parse(result.response.text());
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const model = getAIModel("gemini-1.5-flash");
    const result = await model.generateContent(`Escreva uma mensagem de WhatsApp para o cliente ${leadName} que está no estágio "${status}". 
      O tom deve ser EXTREMAMENTE persuasivo, elegante e "agressivo" no sentido de exclusividade e urgência velada. 
      Foque na transformação de vida e no valor emocional do projeto. Estilo: Proximidade e Autoridade.`);
    return result.response.text();
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const model = getAIModel("gemini-1.5-pro"); // Usando o Pro para textos mais complexos
    const result = await model.generateContent(`Você é um arquiteto renomado com alto poder de fechamento. 
      Gere uma estrutura de proposta comercial persuasiva para ${leadName} baseada nas seguintes notas: "${notes}".
      ${budget ? `O investimento estimado discutido foi de R$ ${budget.toLocaleString('pt-BR')}.` : ''}
      
      A proposta deve seguir este roteiro:
      1. O SONHO: Validação emocional.
      2. O DIAGNÓSTICO: Problemas técnicos e estéticos.
      3. A SOLUÇÃO EXCLUSIVA: Sua abordagem única.
      4. ETAPAS DA JORNADA: Processo de trabalho.
      5. O PRÓXIMO PASSO: CTA forte.`);
    return result.response.text();
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const model = getAIModel("gemini-1.5-pro");
    const result = await model.generateContent(`Você é um consultor técnico de arquitetura e urbanismo. 
      Baseado no texto normativo fornecido abaixo, responda à seguinte dúvida: "${query}"
      
      Texto Normativo/Plano Diretor:
      ${context}
      
      Responda de forma técnica, citando possíveis artigos ou diretrizes mencionados no texto. Seja direto e preciso.`);
    return result.response.text();
  },

  async generateMoodboard(prompt: string) {
    // Fallback de texto para imagem, já que a geração de imagem nativa requer outra API
    try {
        const model = getAIModel("gemini-1.5-flash");
        const result = await model.generateContent(`Crie uma descrição visual detalhada e evocativa para um moodboard de arquitetura com o estilo: ${prompt}. Descreva cores, texturas e atmosfera.`);
        
        console.warn("Geração de imagem nativa indisponível nesta biblioteca padrão. Retornando null.");
        return null; 

    } catch (error) {
        console.error("Erro no moodboard:", error);
        return null;
    }
  }
};
