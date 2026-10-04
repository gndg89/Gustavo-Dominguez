import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPurchase } from "@/actions/purchases";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PurchaseForm } from "@/components/compras/PurchaseForm";

export default async function NewPurchasePage() {
  const [ingredients, suppliers] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Registrar compra"
        description="Al guardar, se actualiza el costo de referencia y el stock del insumo."
      />
      {ingredients.length === 0 ? (
        <Card className="max-w-lg">
          <p className="text-sm text-muted">
            Primero necesitas crear al menos un insumo.
          </p>
          <Link href="/insumos/nuevo" className="mt-3 inline-block">
            <Button>Crear insumo</Button>
          </Link>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <PurchaseForm action={createPurchase} ingredients={ingredients} suppliers={suppliers} />
        </Card>
      )}
    </div>
  );
}
