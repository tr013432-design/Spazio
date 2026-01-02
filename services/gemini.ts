// Chave do projeto Spazio-1 (Ativado!)
const API_KEY = "AIzaSyAgD1ug-BgOvec6jDoLeO0BBM43BHXQ2Dc";

async function callGemini(promptText: string, isJson: boolean = false) {
  // Usando o modelo FLASH 1.5 (Mais rápido e inteligente)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
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
      // Se der erro agora, vai aparecer detalhado no console (F12)
      console.error("ERRO API GOOGLE:", errorData);
      throw new Error(`Erro API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("A IA não retornou texto.");

    if (isJson) {
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    }

    return text;

  } catch (error) {
    console.error("Falha na requisição:", error);
    throw error;
  }
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `Analise este briefing e retorne APENAS um JSON com: styles (array), materials (array), profileSummary (string). Briefing: ${briefing}`;
    return await callGemini(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    return await callGemini(`Escreva mensagem WhatsApp curta e persuasiva para ${leadName} (fase: ${status}).`);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    return await callGemini(`Crie proposta comercial para ${leadName}. Notas: ${notes}. Orçamento: ${budget}. Tópicos: Sonho, Diagnóstico, Solução, Passos.`);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    return await callGemini(`Baseado no texto: "${context}", responda: "${query}"`);
  },

  async generateMoodboard(prompt: string) {
    return null; 
  }
};
