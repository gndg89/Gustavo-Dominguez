# Proyecto Pensado

Marca de Mafe Correa (María Fernanda Correa), registrada en SAPI. Instagram: [@pan.pensado](https://instagram.com/pan.pensado) y [@panesfrugales](https://instagram.com/panesfrugales).

Este directorio reúne los entregables del plan de marketing y las herramientas digitales construidas para el negocio: catálogo de productos, bot de WhatsApp con flujo de pagos, dashboard de gestión y contenido para el evento del 15 de noviembre de 2026.

## Contenido de esta carpeta

- **Catalogo-Pensado.pdf** — Catálogo visual de productos (flores y hojas comestibles, galletas/brownies/tortas sin gluten, pan de sándwich, pita y masa de pizza, tortas, dips árabes, kibbe y falafel congelados, mermeladas). Sin precios confirmados todavía.
- **prompt-sistema-bot-pensado.md** — Prompt de sistema v2 del bot de WhatsApp (menú de pedidos y reservas de cursos/asesorías, flujo de pago digital con aprobación de Mafe por Telegram, o atención humana para pago en efectivo).
- **pruebas-simuladas.md** — Casos de prueba simulados para el bot.
- **bot-pagos-bridge/** — Servidor puente (Node.js) que conecta WhatsApp Business (Meta Cloud API) con las aprobaciones de pago de Mafe por Telegram. Incluye `.env.example` con las variables necesarias (sin credenciales reales — hay que copiarlo a `.env` y completarlo).
- **dashboard-pensado-source.html** — Código fuente del dashboard de gestión de Mafe (resumen, pedidos, recetas y costeo, catálogo, cursos, ajustes). Demo con datos de ejemplo, sin backend real todavía.
- **contenido-evento-15nov.md** — Contenido para el evento del 15 de noviembre de 2026, "El sabor de nuestros paisajes en las mieles de las abejas indígenas venezolanas" (curso de miel con cata de abejas angelitas).

## Plan de marketing

Ver [`plan-marketing-pensado/Plan-de-Marketing-Pensado.pdf`](../plan-marketing-pensado/Plan-de-Marketing-Pensado.pdf).

## Otros entregables (artifacts en línea)

- Catálogo de productos (versión interactiva): https://claude.ai/artifact/RGBJVcT7xNgNFYasaUYid1
- Plan de marketing (versión interactiva): https://claude.ai/code/artifact/bc7e0d97-885b-476f-b41d-c4e8bcf5d487
- Panel de costeo de recetas (demo): https://claude.ai/artifact/FU5XENpkq4XgYRSzWH36iM
- Dashboard de Pensado (demo, login mafe/pensado2026): https://claude.ai/artifact/7XQ4h8G26qd9whiqFGs8Gg
- Presentación visual para Mafe (9 diapositivas): https://claude.ai/artifact/FeCjfdYsu7Epe3ZnLrE2Yc
- Lista de pendientes "Pendientes Pensado": https://claude.ai/artifact/WAebMYHGosW8pSwWZqkqkP
- Huerto Pensado 3D (prototipo interactivo, pisos 1-3 según bocetos): https://claude.ai/artifact/Pn3DEhAV4aWBGUQsyGZsfL

## Pendiente de definir

- Precios reales y horarios de cursos.
- Datos bancarios/pago móvil reales de Pensado para el bot.
- Horario real de atención al cliente.
- Cuenta de Instagram activa que llevará el link del catálogo (@pan.pensado vs @panesfrugales).
- Confirmación de si la pita, la masa de pizza y el falafel son libres de gluten.
- Backend real del dashboard (hoy es solo una demo del lado del cliente).
- Puente real que conecte el pago por WhatsApp con la aprobación por Telegram en producción (hoy es un prototipo en `bot-pagos-bridge/`).
