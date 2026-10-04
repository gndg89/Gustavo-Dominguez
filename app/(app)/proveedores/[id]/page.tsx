import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateSupplier } from "@/actions/suppliers";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { SupplierForm } from "@/components/proveedores/SupplierForm";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });
  if (!supplier) notFound();

  const updateAction = updateSupplier.bind(null, supplier.id);

  return (
    <div>
      <PageHeader title={supplier.name} description="Editar datos del proveedor." />
      <Card className="max-w-lg">
        <SupplierForm
          action={updateAction}
          defaultValues={supplier}
          submitLabel="Guardar cambios"
        />
      </Card>
    </div>
  );
}
