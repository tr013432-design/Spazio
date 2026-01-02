// Chave API definida diretamente
const API_KEY = "AIzaSyAgD1ug-BgOvec6jDoLeO0BBM43BHXQ2Dc";

// Função genérica para chamar a API do Google diretamente (sem SDK)
async function callGeminiAPI(model: string, prompt: string, isJson: boolean = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: isJson ? { response_mime_type: "application/json" } : {}
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ERRO DETALHADO DA API:", errorData);
      throw new Error(`Erro API Google: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) throw new Error("A API retornou vazio.");
    
    return isJson ? JSON.parse(text) : text;

  } catch (error) {
    console.error("Falha na requisição Gemini:", error);
    throw error; // Repassa o erro para aparecer na tela vermelha
  }
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `Analise o seguinte briefing de arquitetura e retorne APENAS um JSON com este formato:
    { "styles": ["estilo1", "estilo2"], "materials": ["material1", "material2"], "profileSummary": "resumo aqui" }
    
    Briefing: ${briefing}`;

    return await callGeminiAPI("gemini-1.5-flash", prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const prompt = `Escreva uma mensagem curta de WhatsApp persuasiva para o cliente ${leadName} (fase: ${status}). Sem hashtags.`;
    return await callGeminiAPI("gemini-1.5-flash", prompt);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const prompt = `Crie uma estrutura de proposta comercial para ${leadName}. Notas: ${notes}. Orçamento: ${budget}. Resuma em tópicos: Sonho, Diagnóstico, Solução.`;
    return await callGeminiAPI("gemini-1.5-flash", prompt);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const prompt = `Com base no texto: "${context}", responda: "${query}"`;
    return await callGeminiAPI("gemini-1.5-flash", prompt);
  },

  async generateMoodboard(prompt: string) {
    // A API de texto não gera imagem. Retornamos null para não quebrar.
    console.warn("Geração de imagem requer API Imagen dedicada.");
    return null;
  }
};
