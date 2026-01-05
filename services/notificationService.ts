// src/services/notificationService.ts

const TELEGRAM_BOT_TOKEN = AAFwaArZuGBj6gdXb600SYB7I-t_paZxzca'; // Cole o token do BotFather
const TELEGRAM_CHAT_ID = 6021688560; // Cole seu ID numérico

export const sendMobileNotification = async (title: string, message: string) => {
  // 1. Notificação no Console (Debug)
  console.log(`[MOBILE PUSH] ${title}: ${message}`);

  // 2. Envio para Telegram
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    const text = `🚨 *${title}*\n\n${message}\n\n_Enviado via ArchiFlow OS_`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Erro ao enviar para Telegram:', error);
    }
  }
};
