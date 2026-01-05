// src/services/notificationService.ts

// DADOS REAIS DO SEU BOT (Agora completos)
const TELEGRAM_BOT_TOKEN = '7454155603:AAFwaArZuGBj6gdXb600SYB7I-t_paZxzcA';
const TELEGRAM_CHAT_ID = '6021688560';

export const sendMobileNotification = async (title: string, message: string) => {
  // Log no console para você confirmar que a função foi chamada
  console.log(`🚀 [SPAZIO PUSH] Enviando: ${title}`);

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    // Texto formatado com Markdown (Negrito e Itálico)
    // Atualizei a assinatura para "Spazio OS" conforme o rebranding
    const text = `🚨 *${title}*\n\n${message}\n\n_Enviado via Spazio OS_`;
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();

      if (data.ok) {
        console.log('✅ [SUCESSO] Notificação enviada para o celular!');
      } else {
        console.error('❌ [ERRO TELEGRAM]', data);
      }

    } catch (error) {
      console.error('❌ [ERRO DE REDE]', error);
    }
  } else {
    console.warn('⚠️ Token ou ID do Chat não configurados.');
  }
};
