import { GoogleGenerativeAI } from "@google/generative-ai";

// --- SUA NOVA CHAVE (ATUALIZADA) ---
const API_KEY = "AIzaSyDueLPbw6PKas2WaV6OICety1kYPadNAtY";

// Função interna que tenta chamar um modelo específico
async function tryModel(modelName: string, promptText: string, isJson: boolean) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  
  const payload: any = {
    contents: [{ parts: [{ text: promptText }] }]
  };

  // O modelo Flash aceita modo JSON nativo, o Pro antigo não.
  if (isJson && modelName.includes("flash")) {
    payload.generationConfig = { response_mime_type: "application/json" };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Lança erro para o sistema tentar o próximo modelo
    throw new Error(`Erro no modelo ${modelName}: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("A IA retornou uma resposta vazia.");

  return text;
}

// Função principal que gerencia as tentativas (Flash -> Pro)
async function callGemini(promptText: string, isJson: boolean = false) {
  try {
    // 1ª Tentativa: Modelo Flash 1.5 (Mais rápido e inteligente)
    const text = await tryModel("gemini-1.5-flash", promptText, isJson);
    return parseResponse(text, isJson);
  } catch (error) {
    console.warn("Flash falhou, tentando modelo Pro (Backup)...", error);
    try {
      // 2ª Tentativa: Modelo Pro 1.0 (Backup universal)
      const text = await tryModel("gemini-pro", promptText, false); 
      return parseResponse(text, isJson);
    } catch (finalError) {
      console.error("Erro fatal na IA (Todos os modelos falharam):", finalError);
      throw finalError;
    }
  }
}

// Função auxiliar para limpar e ler o JSON
function parseResponse(text: string, isJson: boolean) {
  if (!text) return null;
  if (!isJson) return text;

  try {
    // Remove formatação de código que a IA coloca às vezes
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro ao ler JSON da resposta:", text);
    // Retorna um objeto padrão para não travar o site em caso de erro de formatação
    return {
      styles: ["Moderno", "Minimalista"],
      materials: ["Concreto", "Madeira"],
      profileSummary: "Resumo gerado, mas houve um erro na formatação dos dados."
    };
  }
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `Atue como um arquiteto. Analise este briefing e retorne APENAS um JSON válido com as chaves:
    - styles: array de 3 strings (ex: ["Moderno", "Industrial"]).
    - materials: array de 3 strings.
    - profileSummary: string com resumo curto.
    
    Briefing: "${briefing}"`;
    return await callGemini(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    return await callGemini(`Escreva uma mensagem curta de WhatsApp para o cliente ${leadName} (fase: ${status}). Seja elegante e persuasivo.`);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const prompt = `Crie uma proposta comercial para ${leadName}. 
    Notas: "${notes}". 
    ${budget ? `Orçamento: R$ ${budget}` : ''}
    
    Use títulos em Markdown (##) para: 1. O Conceito, 2. O Diagnóstico, 3. A Solução.`;
    
    return await callGemini(prompt);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    return await callGemini(`Baseado no texto: "${context}", responda: "${query}"`);
  },

  async generateMoodboard(prompt: string) {
    return null;
  }
};
