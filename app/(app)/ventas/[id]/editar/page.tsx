import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSale } from "@/actions/sales";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { SaleEditForm } from "@/components/ventas/SaleEditForm";

export default async function EditSalePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { dish: true },
  });

  if (!sale) notFound();

  const updateAction = updateSale.bind(null, sale.id);

  return (
    <div>
      <PageHeader
        title="Editar venta"
        description="El plato no se puede cambiar aquí; si vendiste otro plato, borra esta venta y registra una nueva."
      />
      <Card className="max-w-lg">
        <SaleEditForm
          action={updateAction}
          dishName={sale.dish.name}
          unitPrice={sale.unitPrice}
          defaultValues={{
            quantity: sale.quantity,
            currency: sale.currency,
            paymentMethod: sale.paymentMethod,
            saleDate: sale.saleDate,
          }}
        />
      </Card>
    </div>
  );
}
