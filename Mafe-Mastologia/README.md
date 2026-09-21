# Mafe Mastología — Proyecto de Mercadeo Digital

## 1. Resumen del proyecto

Estrategia de contenido y presencia en redes sociales para un equipo de cirujanos mastólogos ("de la vieja escuela") con reputación consolidada. El objetivo no es "vender cirugías", sino **construir confianza y autoridad médica** para captar pacientes que enfrentan un diagnóstico (nódulos, cáncer de mama, etc.) y buscan seguridad, experiencia y trato humano.

- **Cliente:** cirujana mastóloga + su equipo de cirujanos.
- **Responsable de mercadeo:** Gustavo.
- **Estado:** definición inicial de estrategia.

## 2. Posicionamiento central

> "Los serios. Los que llevan más de 20 años. A quienes otros médicos les refieren sus casos difíciles."

El diferenciador es la **trayectoria y el rigor** frente a los "médicos influencer" con más marketing que experiencia. Se vende gravedad y experiencia, no gimmicks.

## 3. Público objetivo

| Segmento | Estado emocional | Qué busca |
|----------|------------------|-----------|
| Mujer preocupada por prevención | Alerta, informándose | Educación, cuándo hacerse chequeos |
| Mujer con hallazgo reciente (nódulo) | Ansiosa, con miedo | Calma, claridad, próximos pasos |
| Paciente ya diagnosticada | Aterrada, vulnerable | Confianza en quién la va a operar, opciones |
| Familiares / referidores | Buscando por su ser querido | Reputación, resultados, humanidad |

## 4. Pilares de contenido

**Distribución sugerida:** ~50–60% educación · ~20% equipo/autoridad · ~10–15% historias · ~10% resolución de miedos.

### 4.1 Educación y prevención (motor de alcance)
- "Cómo hacerte un autoexamen de mama, paso a paso"
- "3 mitos sobre el cáncer de mama que escucho cada semana en consulta"
- "¿A qué edad debo hacerme la primera mamografía?"
- "Qué significa realmente que te encuentren un nódulo"

### 4.2 El equipo como héroe (autoridad)
- Perfil de cada cirujano: años de experiencia, formación, casos operados
- "Por qué elegí dedicarme a esto" (lado humano)
- Detrás de cámara del equipo discutiendo casos (transmite rigor)

### 4.3 Historias de pacientes / sobrevivientes (con consentimiento firmado)
- Testimonio de superación, sin dramatización ni "antes y después" morbosos
- El contenido más poderoso, pero el más delicado

### 4.4 Resolución de miedos concretos
- "¿Voy a perder la mama? Opciones de reconstrucción hoy"
- "Qué pasa desde que te diagnostican hasta la cirugía"
- Sesiones de preguntas en vivo / por historias

## 5. Formatos y canales

- **Reels / Shorts** (video vertical corto) → alcance orgánico
- **Carruseles** → explicar temas paso a paso
- **Lives / Q&A** → cerrar confianza
- **Stories** → cercanía diaria, preguntas
- **CTA principal:** WhatsApp para agendar (contexto Venezuela)

## 6. Embudo (funnel)

1. **Atracción:** contenido educativo (Reels/carruseles) → alcance.
2. **Lead magnet:** guía gratis descargable — *"Detección temprana del cáncer de mama: lo que toda mujer debería saber"* a cambio del contacto.
3. **Nutrición:** contenido de autoridad + resolución de miedos.
4. **Conversión:** CTA a WhatsApp → agenda de consulta.

## 7. Reglas éticas y de cumplimiento (obligatorias)

- ❌ No prometer "cura" ni garantizar resultados (viola ética médica y políticas de anuncios de salud de Meta).
- ⚠️ Meta restringe fuertemente el contenido oncológico en anuncios pagados — revisar antes de pautar.
- ✅ Consentimiento **por escrito** para cualquier imagen o testimonio de paciente.
- ✅ Dignidad ante todo: son personas en su momento más vulnerable.

## 8. Próximos pasos (por decidir)

- [ ] Definir tono de voz e identidad visual del equipo
- [ ] Armar calendario de contenido de las primeras 2–4 semanas
- [ ] Diseñar el lead magnet (guía PDF)
- [ ] Configurar CTA/flujo de WhatsApp
- [ ] (Opcional) Sistema/herramienta para gestionar el calendario y los leads

## 9. Ideas para la parte técnica (Code)

Posibles componentes a construir según avance el proyecto:

- **Landing page** con la guía descargable (captura de leads → correo/WhatsApp).
- **Calendario editorial** en datos (JSON/CSV) + script para planificar y hacer seguimiento de publicaciones.
- **Bot / flujo de WhatsApp** para responder consultas iniciales y agendar (encaja con el stack: FastAPI + PostgreSQL).
- **Dashboard** (Power BI / web) para métricas de alcance, leads y conversiones.

### Estructura del repo

```
Mafe-Mastologia/
├── README.md
├── contenido/
│   ├── calendario.json        # calendario editorial
│   └── guiones/               # scripts de Reels/carruseles
├── landing/                   # landing + lead magnet
├── lead-magnet/               # PDF y assets de la guía
├── whatsapp-bot/              # flujo de captación/agenda (FastAPI)
└── analytics/                 # métricas y dashboard
```
