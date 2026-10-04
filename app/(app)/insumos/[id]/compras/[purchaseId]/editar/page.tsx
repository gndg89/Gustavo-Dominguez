import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { unitLabel } from "@/lib/utils";
import { updatePurchase } from "@/actions/purchases";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PurchaseForm } from "@/components/compras/PurchaseForm";

export default async function EditPurchasePage({
  params,
}: {
  params: Promise<{ id: string; purchaseId: string }>;
}) {
  const { id, purchaseId } = await params;

  const [purchase, suppliers] = await Promise.all([
    prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { ingredient: true },
    }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!purchase || purchase.ingredientId !== id) notFound();

  const updateAction = updatePurchase.bind(null, purchase.id);

  return (
    <div>
      <PageHeader
        title={`Editar compra de ${purchase.ingredient.name}`}
        description={`Cantidad y costo en ${unitLabel(purchase.ingredient.unit)}. El stock y el costo actual del insumo se recalculan automáticamente.`}
      />
      <Card className="max-w-lg">
        <PurchaseForm
          action={updateAction}
          ingredientUnit={purchase.ingredient.unit}
          suppliers={suppliers}
          submitLabel="Guardar cambios"
          defaultValues={{
            quantity: purchase.quantity,
            totalCost: purchase.totalCost,
            currency: purchase.currency,
            paymentMethod: purchase.paymentMethod,
            supplierId: purchase.supplierId,
            purchaseDate: purchase.purchaseDate,
            notes: purchase.notes,
          }}
        />
      </Card>
    </div>
  );
}
