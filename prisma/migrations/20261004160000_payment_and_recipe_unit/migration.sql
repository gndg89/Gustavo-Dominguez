-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BS', 'USD');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'PAGO_MOVIL', 'TRANSFERENCIA', 'ZELLE', 'TARJETA', 'OTRO');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'BS',
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO';

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'BS',
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'EFECTIVO';

-- AlterTable: RecipeItem.unit se agrega nullable, se rellena desde el insumo de cada línea
-- (filas existentes no tienen una unidad propia todavía) y luego se exige NOT NULL.
ALTER TABLE "RecipeItem" ADD COLUMN     "unit" "Unit";

UPDATE "RecipeItem" ri
SET "unit" = i."unit"
FROM "Ingredient" i
WHERE i."id" = ri."ingredientId";

ALTER TABLE "RecipeItem" ALTER COLUMN "unit" SET NOT NULL;
