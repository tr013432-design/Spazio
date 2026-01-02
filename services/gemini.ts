import { GoogleGenerativeAI } from "@google/generative-ai";

// --- SUA NOVA CHAVE DE API (Do projeto Spazio-1) ---
const API_KEY = "AIzaSyChok5AQ6eMFacL1qUgwc8wNDMLYAxVtHA";

// Função interna que tenta chamar um modelo específico
async function tryModel(modelName: string, promptText: string, isJson: boolean) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
  
  const payload: any = {
    contents: [{ parts: [{ text: promptText }] }]
  };

  // Configuração especial: O modelo 'flash' aceita JSON nativo, o 'pro' antigo não.
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
    throw new Error(`Erro no modelo ${modelName}: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("A IA retornou uma resposta vazia.");

  return text;
}

// Função principal que gerencia as tentativas
async function callGemini(promptText: string, isJson: boolean = false) {
  try {
    // 1ª Tentativa: Modelo Flash (Mais rápido e inteligente)
    const text = await tryModel("gemini-1.5-flash", promptText, isJson);
    return parseResponse(text, isJson);
  } catch (error) {
    console.warn("Falha no Flash, tentando modelo Pro...", error);
    try {
      // 2ª Tentativa: Modelo Pro (Backup de segurança universal)
      const text = await tryModel("gemini-pro", promptText, false); // Pro não suporta json-mode nativo
      return parseResponse(text, isJson);
    } catch (finalError) {
      console.error("Erro fatal na IA:", finalError);
      throw finalError;
    }
  }
}

// Função auxiliar para limpar e ler o JSON (remove ```json ... ```)
function parseResponse(text: string, isJson: boolean) {
  if (!isJson) return text;

  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Erro ao ler JSON:", text);
    // Retorna um objeto padrão para não travar o site
    return {
      styles: ["Moderno", "Minimalista", "Industrial"],
      materials: ["Concreto", "Madeira", "Aço"],
      profileSummary: "Não foi possível estruturar o perfil automaticamente."
    };
  }
}

export const geminiService = {
  async analyzeBriefing(briefing: string) {
    const prompt = `Atue como um arquiteto sênior. Analise o briefing abaixo e retorne APENAS um JSON válido com as chaves:
    - styles: array de 3 strings com estilos sugeridos.
    - materials: array de 3 strings com materiais.
    - profileSummary: string com resumo do perfil do cliente.
    
    Briefing: "${briefing}"`;
    return await callGemini(prompt, true);
  },

  async generateFollowUpMessage(leadName: string, status: string) {
    return await callGemini(`Escreva uma mensagem curta de WhatsApp (sem hashtags) para o cliente ${leadName} que está na fase: ${status}. Use um tom elegante, exclusivo e persuasivo.`);
  },

  async generateProposal(leadName: string, notes: string, budget?: number) {
    const prompt = `Crie uma estrutura de proposta comercial para ${leadName}. 
    Notas do projeto: "${notes}". 
    ${budget ? `Orçamento estimado: R$ ${budget}` : ''}
    
    Estruture a resposta com estes tópicos (use markdown para títulos):
    ## 1. O Sonho (Conexão emocional)
    ## 2. O Diagnóstico (O que precisa ser resolvido)
    ## 3. A Solução (Sua abordagem única)
    ## 4. Próximos Passos`;
    
    return await callGemini(prompt);
  },

  async analyzeRegulatoryDocs(context: string, query: string) {
    return await callGemini(`Baseado APENAS no seguinte texto técnico, responda à pergunta de forma direta:
    
    Texto: "${context}"
    
    Pergunta: "${query}"`);
  },

  async generateMoodboard(prompt: string) {
    // A API de texto não gera imagens. Retornamos null para o frontend tratar.
    return null;
  }
};
