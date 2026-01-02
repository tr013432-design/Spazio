// Chave do projeto Spazio-1
const API_KEY = "AIzaSyAgD1ug-BgOvec6jDoLeO0BBM43BHXQ2Dc";

async function callGemini(promptText: string, isJson: boolean = false) {
  // MUDANÇA CRUCIAL: Usando 'gemini-pro' (versão 1.0) que é universalmente compatível
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
  
  const payload = {
    contents: [{ parts: [{ text: promptText }] }],
    // O gemini-pro não suporta 'response_mime_type: application/json' nativo,
    // então removemos essa linha e tratamos o JSON manualmente abaixo.
    generationConfig: {
      temperature: 0.7
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ERRO API GOOGLE:", errorData);
      throw new Error(`Erro API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("A IA não retornou texto.");

    if (isJson) {
      // Limpeza agressiva para garantir que o JSON funcione
      // O gemini-pro adora colocar ```json no começo, isso remove.
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(cleanText);
      } catch (e) {
        console.error("Falha ao ler JSON da IA:", cleanText);
        // Fallback simples caso a IA erre o formato do JSON
        return {
          styles: ["Moderno", "Minimalista"],
          materials: ["Concreto", "Madeira"],
          profileSummary: "Resumo gerado automaticamente (Erro de formatação JSON)."
        };
      }
    }

    return text;

  } catch (error) {
    console.error("Falha na requisição:", error);
    throw error;
  }
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    // Prompt reforçado para garantir JSON
    const prompt = `Analise este briefing de arquitetura. Responda APENAS com um JSON válido (sem markdown) seguindo estritamente este formato:
    { "styles": ["estilo1", "estilo2"], "materials": ["material1", "material2"], "profileSummary": "texto do resumo" }
    
    Briefing: ${briefing}`;
    return await callGemini(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    return await callGemini(`Escreva uma mensagem curta de WhatsApp (sem hashtags) para o cliente ${leadName} que está na fase: ${status}. Seja elegante e persuasivo.`);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    return await callGemini(`Crie uma proposta comercial para ${leadName}. Notas: ${notes}. Orçamento: ${budget}. Estruture com títulos: O Sonho, O Diagnóstico, A Solução.`);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    return await callGemini(`Com base no texto a seguir: "${context}", responda à dúvida: "${query}"`);
  },

  async generateMoodboard(prompt: string) {
    return null; 
  }
};
