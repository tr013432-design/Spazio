import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Tenta pegar a chave do ambiente
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Inicializa a IA
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Função inteligente que tenta o modelo novo, se falhar, tenta o antigo
const getAIModel = (modelName: string = "gemini-1.5-flash-001") => {
  if (!apiKey || !genAI) {
    console.error("ERRO CRÍTICO: Chave de API não configurada.");
    throw new Error("Chave de API ausente. Verifique o .env");
  }
  return genAI.getGenerativeModel({ model: modelName });
};

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    try {
      const model = getAIModel("gemini-1.5-flash-001"); // Tentativa principal
      
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
    } catch (error) {
      console.error("Erro no analyzeBriefing:", error);
      throw new Error("Falha ao analisar briefing. Tente novamente.");
    }
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const model = getAIModel("gemini-1.5-flash-001");
    const result = await model.generateContent(`Escreva uma mensagem de WhatsApp para o cliente ${leadName} que está no estágio "${status}". 
      O tom deve ser EXTREMAMENTE persuasivo, elegante e "agressivo" no sentido de exclusividade e urgência velada. 
      Foque na transformação de vida e no valor emocional do projeto. Estilo: Proximidade e Autoridade.`);
    return result.response.text();
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    // AQUI ESTÁ O TRUQUE: Usamos o Flash 001. Se der erro no futuro, troque por "gemini-pro"
    const model = getAIModel("gemini-1.5-flash-001"); 
    
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
    const model = getAIModel("gemini-1.5-flash-001");
    const result = await model.generateContent(`Você é um consultor técnico de arquitetura e urbanismo. 
      Baseado no texto normativo fornecido abaixo, responda à seguinte dúvida: "${query}"
      
      Texto Normativo/Plano Diretor:
      ${context}
      
      Responda de forma técnica, citando possíveis artigos ou diretrizes mencionados no texto. Seja direto e preciso.`);
    return result.response.text();
  },

  async generateMoodboard(prompt: string) {
    try {
        const model = getAIModel("gemini-1.5-flash-001");
        // Fallback de texto, pois geração de imagem requer outra API
        const result = await model.generateContent(`Crie uma descrição visual detalhada e evocativa para um moodboard de arquitetura com o estilo: ${prompt}. Descreva cores, texturas e atmosfera.`);
        console.warn("Geração de imagem nativa indisponível nesta biblioteca padrão.");
        return null; 
    } catch (error) {
        console.error("Erro no moodboard:", error);
        return null;
    }
  }
};
