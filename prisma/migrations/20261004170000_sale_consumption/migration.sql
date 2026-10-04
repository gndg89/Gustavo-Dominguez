-- CreateTable
CREATE TABLE "SaleConsumption" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SaleConsumption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SaleConsumption_saleId_idx" ON "SaleConsumption"("saleId");

-- CreateIndex
CREATE INDEX "SaleConsumption_ingredientId_idx" ON "SaleConsumption"("ingredientId");

-- AddForeignKey
ALTER TABLE "SaleConsumption" ADD CONSTRAINT "SaleConsumption_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleConsumption" ADD CONSTRAINT "SaleConsumption_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill defensivo: reconstruye el consumo de insumos de las ventas que ya existían
-- antes de esta migración (editar/borrar una venta vieja necesita saber qué consumió).
-- Usa la receta ACTUAL del plato como mejor aproximación disponible.
INSERT INTO "SaleConsumption" (id, "saleId", "ingredientId", quantity)
SELECT
  gen_random_uuid()::text,
  s.id,
  ri."ingredientId",
  ri.quantity * s.quantity *
    CASE
      WHEN ri.unit = i.unit THEN 1
      WHEN ri.unit = 'GRAM' AND i.unit = 'KILOGRAM' THEN 0.001
      WHEN ri.unit = 'KILOGRAM' AND i.unit = 'GRAM' THEN 1000
      WHEN ri.unit = 'MILLILITER' AND i.unit = 'LITER' THEN 0.001
      WHEN ri.unit = 'LITER' AND i.unit = 'MILLILITER' THEN 1000
      ELSE 1
    END
FROM "Sale" s
JOIN "RecipeItem" ri ON ri."dishId" = s."dishId"
JOIN "Ingredient" i ON i.id = ri."ingredientId";
