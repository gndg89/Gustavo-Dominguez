// Puente de aprobación de pagos para Pensado.
//
// Qué hace: cuando un cliente manda el capture del pago por WhatsApp, este
// servicio lo reenvía a Mafe por Telegram con botones "Aprobar" / "Rechazar".
// Cuando Mafe toca un botón, el servicio le escribe de vuelta al cliente por
// WhatsApp confirmando o rechazando el pago. El bot (el prompt del sistema en
// prompt-sistema-bot-pensado.md) nunca decide el pago por su cuenta: eso lo
// hace siempre Mafe desde Telegram, tal como quedó definido el 2026-10-06.
//
// Requiere credenciales reales (WhatsApp Cloud API + Telegram) que todavía no
// existen en el proyecto — ver README.md para cómo conseguirlas y desplegar.

require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const FormData = require('form-data');

const {
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_VERIFY_TOKEN,
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  PORT = 3000,
} = process.env;

const app = express();
app.use(express.json());

const GRAPH = 'https://graph.facebook.com/v20.0';
const TG = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

function requireEnv(res, ...names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    res.status(500).send(`Faltan variables de entorno: ${missing.join(', ')}`);
    return false;
  }
  return true;
}

// ---------- WhatsApp -> este servicio ----------

// Meta llama a esto una vez, al configurar el webhook, para verificar que el
// servidor es tuyo.
app.get('/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Mensajes entrantes de WhatsApp. Nos interesan los mensajes de imagen: se
// tratan como el capture de un pago. El pie de foto (caption) debería traer
// el resumen del pedido/reserva — el prompt del bot le pide eso al cliente
// antes de pedirle el capture.
app.post('/webhook/whatsapp', async (req, res) => {
  res.sendStatus(200); // Meta espera un 200 rápido; el resto es async.
  try {
    const entry = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];
    if (!message) return; // status updates, lecturas, etc. — se ignoran

    const fromWaId = message.from; // número del cliente, formato WhatsApp
    const customerName = entry?.contacts?.[0]?.profile?.name || 'Cliente';

    if (message.type === 'image') {
      const caption = message.image.caption || '(sin texto adjunto)';
      await forwardPaymentToTelegram({
        waId: fromWaId,
        customerName,
        caption,
        mediaId: message.image.id,
      });
    }
    // otros tipos de mensaje (texto, audio, etc.) los maneja el bot de
    // conversación, no este puente — este servicio solo se mete en el paso
    // de "mandó el capture del pago".
  } catch (err) {
    console.error('Error procesando webhook de WhatsApp:', err);
  }
});

async function forwardPaymentToTelegram({ waId, customerName, caption, mediaId }) {
  // 1) pedirle a WhatsApp la URL real del archivo (expira rápido, hay que
  //    descargarlo enseguida)
  const mediaInfo = await fetch(`${GRAPH}/${mediaId}`, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
  }).then((r) => r.json());
  if (!mediaInfo.url) throw new Error('No se pudo obtener la URL del capture: ' + JSON.stringify(mediaInfo));

  // 2) descargar el archivo (requiere el mismo token, no es una URL pública)
  const fileRes = await fetch(mediaInfo.url, { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } });
  const fileBuffer = await fileRes.buffer();

  // 3) mandarlo a Telegram con botones de Aprobar / Rechazar. waId va en el
  //    callback_data para poder responderle al cliente correcto cuando Mafe
  //    toque un botón.
  const form = new FormData();
  form.append('chat_id', TELEGRAM_CHAT_ID);
  form.append('photo', fileBuffer, { filename: 'capture.jpg' });
  form.append(
    'caption',
    `💳 Nuevo pago por validar\n\nCliente: ${customerName} (${waId})\nResumen enviado por el cliente:\n${caption}`
  );
  form.append(
    'reply_markup',
    JSON.stringify({
      inline_keyboard: [
        [
          { text: '✅ Aprobar', callback_data: `pay:approve:${waId}` },
          { text: '❌ Rechazar', callback_data: `pay:reject:${waId}` },
        ],
      ],
    })
  );

  const tgRes = await fetch(`${TG}/sendPhoto`, { method: 'POST', body: form }).then((r) => r.json());
  if (!tgRes.ok) throw new Error('Telegram rechazó el envío: ' + JSON.stringify(tgRes));
}

// ---------- Telegram -> este servicio ----------

// Configura el webhook de Telegram para que apunte aquí (ver README). Mafe
// toca "Aprobar" o "Rechazar" y Telegram manda un callback_query.
app.post('/webhook/telegram', async (req, res) => {
  res.sendStatus(200);
  try {
    const cb = req.body?.callback_query;
    if (!cb) return;

    const [, action, waId] = cb.data.split(':'); // "pay:approve:<waId>"
    const approved = action === 'approve';

    // 1) avisarle al cliente por WhatsApp
    await whatsappSendText(
      waId,
      approved
        ? '¡Excelente! Mafe me confirma que el pago está validado. Tu pedido/reserva quedó oficialmente agendado. ¡Gracias por confiar en Pensado!'
        : 'Mafe revisó el pago y por ahora no pudo validarlo. Te va a escribir directo en unos minutos para resolverlo contigo. ¡Gracias por tu paciencia!'
    );

    // 2) quitarle los botones al mensaje de Telegram y marcarlo como resuelto
    await fetch(`${TG}/editMessageCaption`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        caption: cb.message.caption + `\n\n${approved ? '✅ Aprobado' : '❌ Rechazado'} por Mafe`,
      }),
    });

    // 3) responder el callback para que Telegram quite el "reloj" del botón
    await fetch(`${TG}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: cb.id, text: approved ? 'Pago aprobado' : 'Pago rechazado' }),
    });
  } catch (err) {
    console.error('Error procesando callback de Telegram:', err);
  }
});

async function whatsappSendText(toWaId, text) {
  const r = await fetch(`${GRAPH}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toWaId,
      type: 'text',
      text: { body: text },
    }),
  }).then((res) => res.json());
  if (r.error) console.error('WhatsApp rechazó el envío:', r.error);
  return r;
}

app.get('/health', (req, res) => res.send('ok'));

app.listen(PORT, () => {
  console.log(`Puente de pagos de Pensado escuchando en el puerto ${PORT}`);
  if (!WHATSAPP_TOKEN || !TELEGRAM_BOT_TOKEN) {
    console.warn('Faltan credenciales en .env — revisa .env.example. El servidor arranca pero no podrá enviar nada todavía.');
  }
});
