// --- CONFIGURAÇÃO MANUAL (SEM BIBLIOTECA) ---
const API_KEY = "AIzaSyAJh4Y1EYYwpVmXz4KWRCMGlWjir567hdo"; 
// ^^^ COLOCAR SUA CHAVE AIza... DENTRO DAS ASPAS ACIMA ^^^

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

async function callGeminiAPI(prompt: string, isJson: boolean = false) {
  if (API_KEY === "AIzaSyAJh4Y1EYYwpVmXz4KWRCMGlWjir567hdo" || !API_KEY) {
    throw new Error("Chave API não configurada no arquivo gemini.ts");
  }

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      // Se for JSON, forçamos o formato. Se não, é texto livre.
      responseMimeType: isJson ? "application/json" : "text/plain"
    }
  };

  const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("ERRO DETALHADO DA API:", errorData);
    throw new Error(`Erro na API Google: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("A IA não retornou nenhum texto.");

  return isJson ? JSON.parse(text) : text;
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `Analise o seguinte briefing de arquitetura/design e retorne APENAS um JSON (sem markdown) com as propriedades: styles (lista de 3 estilos), materials (lista de materiais), profileSummary (resumo do cliente). Briefing: ${briefing}`;
    return callGeminiAPI(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const prompt = `Escreva uma mensagem de WhatsApp para o cliente ${leadName} que está no estágio "${status}". O tom deve ser persuasivo, elegante e focado em urgência velada. Apenas o texto da mensagem.`;
    return callGeminiAPI(prompt, false);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const prompt = `Você é um arquiteto. Gere uma proposta comercial para ${leadName}. Notas: "${notes}". ${budget ? `Orçamento: R$ ${budget}` : ''}. Estruture com: 1. O Sonho, 2. O Diagnóstico, 3. A Solução, 4. Próximos Passos.`;
    return callGeminiAPI(prompt, false);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const prompt = `Você é um consultor técnico. Baseado neste texto normativo: "${context}". Responda a dúvida: "${query}". Seja técnico e direto.`;
    return callGeminiAPI(prompt, false);
  },

  async generateMoodboard(prompt: string) {
    return null; // Imagem desativada temporariamente
  }
};
