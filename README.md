# Cocina Admin

Panel administrativo para un emprendimiento de restaurante / *dark kitchen*: control de costos de insumos, armado de recetas con cálculo automático de costo por plato, ventas y margen, inventario y proveedores.

## Funcionalidad

- **Insumos**: registra cada materia prima con su unidad de medida (kg, g, L, ml, unidad). Cada compra actualiza el costo de referencia (último precio de compra) y suma al stock.
- **Compras**: historial de compras por insumo, con proveedor opcional.
- **Recetas**: arma un plato agregando insumos y cantidades; el costo total del plato se calcula automáticamente y se ve en vivo mientras editas.
- **Ventas**: registra ventas de un plato; el precio y el costo quedan "congelados" en el momento de la venta, y se descuenta el stock de los insumos usados.
- **Proveedores**: alta y edición simple.
- **Dashboard**: gasto en insumos del mes, ventas del mes, recetas activas, insumos con stock bajo, y los platos más rentables.
- **Usuarios**: login multiusuario (ADMIN / STAFF). Solo un ADMIN puede crear usuarios nuevos.

## Stack técnico

Next.js (App Router, TypeScript) + Prisma ORM + PostgreSQL + NextAuth (Auth.js) v5 con Credentials + Tailwind CSS.

## Cómo correrlo localmente

Necesitas una base de datos Postgres accesible (local, Docker, o la misma que usas en producción en Railway).

```bash
npm install
cp .env.example .env   # ajusta DATABASE_URL a tu Postgres y NEXTAUTH_SECRET
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abre `http://localhost:3000` e inicia sesión con el usuario de ejemplo que crea el seed:

- **Email**: `admin@cocina.local`
- **Contraseña**: `admin1234`

Cambia esa contraseña (o crea tu propio usuario ADMIN) antes de usarlo en producción.

## Scripts disponibles

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run start` — aplica migraciones pendientes, garantiza que exista un usuario admin, y arranca el servidor (pensado para producción/Railway)
- `npm run db:migrate` — crear/aplicar migraciones de Prisma en desarrollo
- `npm run db:seed` — cargar datos de ejemplo (insumos, receta y venta de muestra) — solo para desarrollo local
- `npm run db:studio` — explorar la base de datos con Prisma Studio

## Despliegue en Railway

El proyecto está desplegado en Railway con dos servicios: una base de datos **Postgres** y el servicio **web** (esta app, construida desde la rama `claude/blissful-galileo-tkq5hc`).

Variables de entorno del servicio web:

- `DATABASE_URL` — referencia a la del servicio Postgres (`${{Postgres.DATABASE_URL}}`)
- `NEXTAUTH_SECRET` — secreto propio de producción
- `NEXTAUTH_URL` — el dominio público que Railway asigna al servicio
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (opcionales) — credenciales del usuario admin que `scripts/ensure-admin.mjs` crea automáticamente en el primer arranque si no existe ningún usuario todavía. Por defecto: `admin@cocina.local` / `admin1234`.

En cada arranque, `npm run start` corre `prisma migrate deploy` (aplica migraciones pendientes) y `scripts/ensure-admin.mjs` (crea el admin si la base está vacía) antes de levantar el servidor — ambos pasos son seguros de repetir.

**Nota sobre el plan gratuito de Railway**: el plan Free da $1 de crédito de uso al mes, compartido entre los dos servicios (web + Postgres), con topes de 0.5 GB RAM / 1 vCPU / 1 GB de disco por servicio. Para un panel interno de bajo tráfico suele alcanzar, pero si el uso se pasa de ese crédito y no hay una tarjeta registrada en la cuenta, Railway pausa el servicio hasta el mes siguiente. Si eso pasa, la alternativa es esperar al siguiente ciclo o pasar al plan Hobby (desde $5/mes) agregando una tarjeta.
