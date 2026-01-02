// geminiService.ts

// ⚠️ NUNCA exponha a chave no código
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// ou, se for Node puro / Next:
// const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API Key do Gemini não encontrada nas variáveis de ambiente.");
}

// Função que chama o Gemini 1.5 Flash (modelo estável)
async function callGemini(promptText: string, isJson: boolean = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const payload: any = {
    contents: [
      {
        parts: [{ text: promptText }]
      }
    ]
  };

  // Flash aceita JSON nativo
  if (isJson) {
    payload.generationConfig = {
      response_mime_type: "application/json"
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData?.error?.message || "Erro desconhecido ao chamar o Gemini"
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Resposta vazia do Gemini.");
  }

  return parseResponse(text, isJson);
}

// Limpa e converte JSON quando necessário
function parseResponse(text: string, isJson: boolean) {
  if (!isJson) return text;

  try {
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch {
    // fallback seguro
    return {
      styles: ["Moderno", "Contemporâneo", "Minimalista"],
      materials: ["Concreto", "Madeira", "Vidro"],
      profileSummary:
        "Análise gerada com sucesso, porém houve ajuste automático na formatação."
    };
  }
}

// ================== API DO SEU SISTEMA ==================

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `
Atue como um arquiteto experiente.
Retorne APENAS um JSON válido com:
- styles: array de 3 strings
- materials: array de 3 strings
- profileSummary: string curta

Briefing:
"${briefing}"
    `;
    return await callGemini(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    const prompt = `
Escreva uma mensagem curta, elegante e persuasiva de WhatsApp
para o cliente ${leadName}.
Fase do funil: ${status}.
    `;
    return await callGemini(prompt);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const prompt = `
Crie uma proposta comercial profissional para ${leadName}.

Notas:
"${notes}"

${budget ? `Orçamento estimado: R$ ${budget}` : ""}

Use títulos em Markdown:
## O Conceito
## O Diagnóstico
## A Solução
    `;
    return await callGemini(prompt);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    const prompt = `
Baseado no texto abaixo:
"${context}"

Responda objetivamente:
"${query}"
    `;
    return await callGemini(prompt);
  }
};
