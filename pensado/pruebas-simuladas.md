# Pruebas simuladas — bot de WhatsApp de Pensado

Conversaciones de prueba corridas a mano contra el prompt ajustado
(`prompt-sistema-bot-pensado.md`), para revisar que cada flujo funcione
antes de ponerlo en producción. No hay bot conectado todavía (no se
configuró ningún servicio externo) — esto es una simulación de cómo
respondería el modelo con ese prompt de sistema.

## 1. Pedido completo

> **Usuario:** Hola, quiero pedir unos brownies y un pan pita
>
> **Asistente:** ¡Hola! Qué gusto saludarte, soy el asistente de Pensado.
> Con gusto te ayudo con tu pedido de brownies y pan pita. Para armarlo,
> cuéntame: ¿cuántos de cada uno quieres, y tus datos de entrega (nombre,
> dirección y teléfono)?
>
> **Usuario:** 6 brownies y 2 panes pita. Soy Carla Pérez, Av. Libertador,
> 0414-1234567
>
> **Asistente:** Perfecto, Carla. Te resumo el pedido:
> - 6 brownies sin gluten
> - 2 panes pita
> - Entrega: Av. Libertador — Carla Pérez — 0414-1234567
>
> ¿Confirmas que estos datos están correctos?
>
> **Usuario:** sí, confirmado
>
> **Asistente:** ¡Listo, Carla! Tu pedido quedó registrado. Mafe se va a
> poner en contacto contigo para coordinar el pago y la entrega. ¡Gracias
> por tu pedido! 🎉

**Resultado:** bien. Toma los datos en un solo intercambio, resume, pide
confirmación explícita antes de cerrar, y no inventa ni precio ni método de
pago — lo deja en manos de Mafe, como quedó en el ajuste.

---

## 2. Reserva de curso

> **Usuario:** 2
>
> **Asistente:** ¡Excelente! Tenemos estas opciones:
> - Taller de emplatado (con visita a huerta y taller de cerámica)
> - Curso de cata de miel de meliponinas
> - Asesoría culinaria
> - Asesoría de registro sanitario
>
> ¿Cuál te interesa, para qué fecha aproximada, y cuál es tu nombre y
> teléfono de contacto?
>
> **Usuario:** el curso de mieles, para noviembre, soy Jorge Ruiz
> 0424-9876543
>
> **Asistente:** Perfecto, Jorge. Te resumo tu solicitud:
> - Curso de cata de miel de meliponinas
> - Fecha de interés: noviembre
> - Contacto: Jorge Ruiz — 0424-9876543
>
> ¿Confirmas que estos datos están correctos?
>
> **Usuario:** sí
>
> **Asistente:** Quedó registrada tu solicitud, Jorge. Mafe te va a
> escribir para confirmarte la fecha exacta y los detalles. ¡Nos vemos
> pronto! 🍯

**Resultado:** bien. No afirma que hay cupo el 15 de noviembre (dato que sí
está en el catálogo de referencia como fecha propuesta, pero el bot
correctamente no la da como confirmada sin que Mafe la valide) — aunque
aquí vale la pena que Gustavo/Mafe decidan si esa fecha ya es pública y el
bot sí puede decirla directo. Por ahora quedó del lado conservador.

---

## 3. Pregunta de alimentación (educativa)

> **Usuario:** ¿De verdad lo sin gluten es más sano que el pan normal?
>
> **Asistente:** Buena pregunta. Lo sin gluten no es "más sano" en
> general — es necesario para quienes tienen celiaquía o sensibilidad al
> gluten, porque en esos casos el gluten sí les hace daño. Para una
> persona sin esa condición, el pan de trigo normal no es perjudicial por
> sí solo. La ventaja de nuestros productos es que son una opción segura y
> rica para quien no puede comer gluten, no que sean superiores para todo
> el mundo. ¿Te gustaría ver el catálogo de panadería sin gluten?

**Resultado:** bien — responde con base científica, sin prometer beneficios
que no corresponden, cumple la restricción crítica de no hacer afirmaciones
médicas o curativas.

---

## 4. Precio no conocido (debe escalar)

> **Usuario:** ¿Cuánto cuesta la torta de zanahoria?
>
> **Asistente:** Para darte el detalle exacto de esto, te voy a pasar con
> Mafe. ¡Dame un momentico! Mientras tanto, si quieres te voy anotando tu
> pedido de la torta de zanahoria con tus datos de entrega, para que ella
> solo te confirme el precio.

**Resultado:** bien — usa la frase fija de escalamiento y, por el ajuste
hecho, no corta la conversación: ofrece seguir tomando el pedido. Esto es
el comportamiento que se quería en vez del original ("detener la venta").

---

## 5. Mensaje confuso / fuera de flujo

> **Usuario:** ueno y lo otro q me dijiste de lo de la cosa esa de la vaina
>
> **Asistente:** Disculpa, no logré entender bien tu mensaje. ¿Me lo puedes
> explicar de otra forma, por favor?
>
> **Usuario:** ueeeno dejaloo
>
> **Asistente:** No hay problema. Si quieres, te dejo el menú principal:
> 1) Pedir productos del catálogo 📦
> 2) Reservar un curso o asesoría 🗓️
> O si prefieres, te paso directo con una persona para que te ayude. ¿Cuál
> prefieres?

**Resultado:** bien — un solo intento de aclaratoria, y después ofrece las
dos salidas (menú o persona) como pide la regla 6, sin quedarse en bucle.

---

## 6. Caso límite no cubierto en el original: pregunta fuera de tema

> **Usuario:** oye y ustedes hacen catering para boda?

**Asistente (con el prompt ajustado):** Para confirmarte si Mafe puede
armar algo especial como catering de boda, te voy a pasar con ella
directamente, porque eso se sale un poco del catálogo que tengo acá.
¡Dame un momentico!

**Resultado:** este caso no estaba explícitamente cubierto en el borrador
original de Gustavo (que solo hablaba de precio/disponibilidad como
gatillo de escalamiento). Se agregó "fuera de productos/cursos/alimentación"
como gatillo explícito en la regla 5 para que el bot no intente improvisar
una respuesta sobre servicios que no están en el catálogo.

---

## 7. Pago digital con capture (aprobado)

> **Asistente:** ¿Confirmas que estos datos están correctos?
>
> **Usuario:** sí
>
> **Asistente:** ¡Perfecto! El total es [monto]. Puedes pagar por
> transferencia o pago móvil a estos datos: Banco: [banco], Cédula/RIF:
> [cédula/RIF], Teléfono: [teléfono]. En cuanto hagas el pago, pásame por
> aquí el capture para validarlo. ¿Prefieres digital o efectivo?
>
> **Usuario:** digital
>
> *(el usuario envía una imagen del comprobante)*
>
> **Asistente:** ¡Gracias! Acabo de enviar tu capture a Mafe para la
> validación. Te aviso por aquí en cuanto me confirme.
>
> *(Mafe aprueba desde Telegram con el botón)*
>
> **Asistente:** ¡Excelente! Mafe me confirma que el pago está validado. Tu
> pedido quedó oficialmente agendado. ¡Gracias por confiar en Pensado!

**Resultado:** bien — el bot nunca decide por sí mismo que el pago es
válido; solo transmite la confirmación que viene de Mafe. No inventa un
"ya quedó pagado" antes de que llegue la señal.

---

## 8. Pago digital con capture (rechazado)

Mismo punto de partida que la prueba 7, pero Mafe rechaza desde Telegram.

> **Asistente:** Disculpa, Mafe tuvo un inconveniente al validar el pago.
> Te va a escribir directamente en unos minutos para revisarlo contigo.

**Resultado:** bien — no especula por qué fue rechazado (monto distinto,
comprobante ilegible, etc.), solo avisa que Mafe interviene. Evita que el
bot le diga al cliente algo incorrecto sobre su propio pago.

---

## 9. Pago en efectivo

> **Asistente:** ¿Prefieres pagar digital o en efectivo?
>
> **Usuario:** en efectivo
>
> **Asistente:** ¡Perfecto! Como el pago es en efectivo, voy a comunicarte
> directamente con Mafe para que coordine contigo la entrega y el cambio
> exacto. ¡Dame un momentico y ya te atiende!

**Resultado:** bien — corta la automatización de inmediato en vez de seguir
"actuando" como si fuera a procesar algo que no puede validar sola. Punto a
vigilar: esto depende de que exista un aviso real a Mafe fuera del chat
(por ahora el prompt lo da por hecho); si ese aviso no llega, el cliente
queda esperando sin que nadie sepa que debe intervenir.

---

## Conclusión

El prompt ajustado pasa los 9 escenarios sin inventar precios, sin prometer
beneficios médicos, sin dejar al usuario sin salida, sin cortar pedidos a
mitad de camino cuando falta un dato que solo Mafe puede dar, y sin
aprobar o rechazar un pago por su cuenta. Los puntos que siguen abiertos
(precios reales, datos bancarios reales, la integración real con Telegram,
horario) están listados al final de `prompt-sistema-bot-pensado.md` y no
son de redacción del prompt sino decisiones de negocio o de construcción
técnica del puente WhatsApp↔Telegram.
