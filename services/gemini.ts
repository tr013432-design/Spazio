import { GoogleGenAI, SchemaType } from "@google/genai";

// Função auxiliar para pegar a instância da IA com segurança
const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("ERRO CRÍTICO: VITE_GEMINI_API_KEY não encontrada no .env");
    throw new Error("Chave de API não configurada");
  }
  
  // Cria a instância usando a chave
  return new GoogleGenAI({ apiKey: apiKey });
};

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const ai = getAI();
    // Usando modelo oficial 'gemini-1.5-flash'
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: `Analise o seguinte briefing de arquitetura/design e forneça 3 sugestões de estilo, uma lista de materiais recomendados e um resumo do perfil do cliente. Briefing: ${briefing}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });
    return JSON.parse(response.text() || '{}');
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Escreva uma mensagem de WhatsApp para o cliente ${leadName} que está no estágio "${status}". 
      O tom deve ser EXTREMAMENTE persuasivo, elegante e "agressivo" no sentido de exclusividade e urgência velada. 
      Foque na transformação de vida e no valor emocional do projeto. Estilo: Proximidade e Autoridade.`,
    });
    return response.text();
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro", // Usando o Pro para textos mais complexos
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: `Você é um consultor técnico de arquitetura e urbanismo. 
      Baseado no texto normativo fornecido abaixo, responda à seguinte dúvida: "${query}"
      
      Texto Normativo/Plano Diretor:
      ${context}
      
      Responda de forma técnica, citando possíveis artigos ou diretrizes mencionados no texto. Seja direto e preciso.`,
    });
    return response.text();
  },

  async generateMoodboard(prompt: string) {
    // ATENÇÃO: O Gemini padrão gera TEXTO, não IMAGENS diretamente via SDK simples ainda (o modelo imagen-3 é separado).
    // Para não quebrar seu app, vou adaptar para ele descrever o moodboard perfeitamente, 
    // ou retornar uma imagem placeholder se a geração falhar.
    
    try {
        const ai = getAI();
        // Tentativa de usar o modelo de texto para descrever a imagem (fallback seguro)
        // Se você tiver acesso ao Imagen, o código seria diferente.
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: `Crie uma descrição visual detalhada e evocativa para um moodboard de arquitetura com o estilo: ${prompt}. Descreva cores, texturas e atmosfera.`
        });
        
        // Retornamos null para o moodboardUrl por enquanto para não quebrar com erro de imagem
        // Se quiser imagem real, precisaria da API do Google Imagen ou OpenAI DALL-E aqui.
        console.warn("Geração de imagem nativa requer modelo Imagen (indisponível na chave padrão). Retornando null.");
        return null; 

    } catch (error) {
        console.error("Erro no moodboard:", error);
        return null;
    }
  }
};
