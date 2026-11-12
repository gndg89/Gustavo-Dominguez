# Puente de pagos — Pensado

Este servicio conecta WhatsApp con Telegram para el paso de aprobación de
pagos que define el prompt del bot (`prompt-sistema-bot-pensado.md`):

```
Cliente manda capture por WhatsApp
        │
        ▼
  este servicio
        │  reenvía foto + resumen del pedido a Telegram
        ▼
  Mafe en Telegram ve el capture con botones [Aprobar] [Rechazar]
        │  toca un botón
        ▼
  este servicio
        │  le escribe al cliente por WhatsApp si quedó aprobado o rechazado
        ▼
  Cliente recibe la confirmación
```

El bot de conversación (el que sigue el prompt) y este puente son dos piezas
separadas: el bot lleva la charla y pide el capture; este servicio solo se
activa cuando llega una imagen y se encarga de la aprobación.

## Lo que falta para que funcione de verdad

No se puede probar en vivo sin esto — son cuentas que solo Gustavo/Mafe
pueden crear:

1. **Número de WhatsApp Business + app de Meta** (WhatsApp Cloud API), con su
   `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`. Se crea en
   [developers.facebook.com](https://developers.facebook.com) → "Agregar
   producto" → WhatsApp.
2. **Bot de Telegram**: hablarle a `@BotFather` en Telegram, `/newbot`, y
   guardar el token que da. Después escribirle cualquier mensaje a ese bot
   desde la cuenta de Mafe y visitar una vez
   `https://api.telegram.org/bot<token>/getUpdates` para sacar el
   `chat_id` de Mafe.
3. Un lugar donde correr este servicio con una URL pública HTTPS (Railway,
   Render, Fly.io, etc.) — Meta y Telegram necesitan poder llamar a
   `/webhook/whatsapp` y `/webhook/telegram`.

## Cómo correrlo

```bash
cd bot-pagos-bridge
npm install
cp .env.example .env     # y llenar los valores reales
npm start
```

## Cómo conectarlo una vez desplegado

- **WhatsApp**: en la app de Meta, configurar el webhook apuntando a
  `https://<tu-dominio>/webhook/whatsapp`, con el mismo "verify token" que
  pusiste en `WHATSAPP_VERIFY_TOKEN`, y suscribirse al campo `messages`.
- **Telegram**: una sola vez, llamar a
  `https://api.telegram.org/bot<token>/setWebhook?url=https://<tu-dominio>/webhook/telegram`.

## Qué NO hace este servicio

- No decide si un pago es válido — eso lo decide Mafe tocando el botón.
- No lleva la conversación del bot (menú, catálogo, flujo de pedidos) — eso
  vive en el prompt de sistema y en la plataforma que lo ejecute (pendiente
  de elegir, ver el listado de pendientes del proyecto).
- No guarda historial ni base de datos: es solo el puente de ida y vuelta
  del paso de pago. Si se necesita registro de pagos aprobados/rechazados,
  es un paso siguiente.
