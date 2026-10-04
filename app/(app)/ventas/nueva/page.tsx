import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSale } from "@/actions/sales";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SaleForm } from "@/components/ventas/SaleForm";

export default async function NewSalePage() {
  const dishes = await prisma.dish.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, salePrice: true },
  });

  return (
    <div>
      <PageHeader
        title="Registrar venta"
        description="El precio y costo del plato quedan congelados en este registro."
      />
      {dishes.length === 0 ? (
        <Card className="max-w-lg">
          <p className="text-sm text-muted">Primero necesitas crear al menos una receta.</p>
          <Link href="/recetas/nueva" className="mt-3 inline-block">
            <Button>Crear receta</Button>
          </Link>
        </Card>
      ) : (
        <Card className="max-w-lg">
          <SaleForm action={createSale} dishes={dishes} />
        </Card>
      )}
    </div>
  );
}
