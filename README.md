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

Next.js (App Router, TypeScript) + Prisma ORM + SQLite (desarrollo, fácil de migrar a Postgres) + NextAuth (Auth.js) v5 con Credentials + Tailwind CSS.

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env   # y ajusta NEXTAUTH_SECRET si quieres uno propio
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
- `npm run build` / `npm run start` — build y arranque en producción
- `npm run db:migrate` — crear/aplicar migraciones de Prisma
- `npm run db:seed` — cargar datos de ejemplo
- `npm run db:studio` — explorar la base de datos con Prisma Studio

## Pasar a producción (Postgres)

El `datasource` en `prisma/schema.prisma` está configurado con `provider = "sqlite"`. Para desplegar (por ejemplo en Railway), cambia ese provider a `"postgresql"`, actualiza `DATABASE_URL` a la cadena de conexión de Postgres y vuelve a correr `npx prisma migrate deploy`. El resto del esquema y del código no necesita cambios.
