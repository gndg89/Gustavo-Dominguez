import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatQuantity, unitLabel } from "@/lib/utils";
import { updateIngredient } from "@/actions/ingredients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { IngredientForm } from "@/components/insumos/IngredientForm";

export default async function IngredientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { purchaseDate: "desc" },
        include: { supplier: true },
      },
    },
  });

  if (!ingredient) notFound();

  const updateAction = updateIngredient.bind(null, ingredient.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={ingredient.name}
        description={`Costo actual: ${formatCurrency(ingredient.currentCostPerUnit)} / ${unitLabel(ingredient.unit)} · Stock: ${formatQuantity(ingredient.stockQuantity, ingredient.unit)}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Editar insumo</CardTitle>
          </CardHeader>
          <IngredientForm
            action={updateAction}
            defaultValues={{
              name: ingredient.name,
              unit: ingredient.unit,
              minStockThreshold: ingredient.minStockThreshold,
            }}
            submitLabel="Guardar cambios"
          />
        </Card>

        <Card className="p-0">
          <CardHeader className="p-5 pb-0">
            <CardTitle>Historial de compras</CardTitle>
          </CardHeader>
          <Table className="mt-4">
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Cantidad</Th>
                <Th>Costo total</Th>
                <Th>Precio/unidad</Th>
                <Th>Proveedor</Th>
              </Tr>
            </Thead>
            <Tbody>
              {ingredient.purchases.map((purchase) => (
                <Tr key={purchase.id}>
                  <Td>{formatDate(purchase.purchaseDate)}</Td>
                  <Td>{formatQuantity(purchase.quantity, ingredient.unit)}</Td>
                  <Td>{formatCurrency(purchase.totalCost)}</Td>
                  <Td>{formatCurrency(purchase.pricePerUnit)}</Td>
                  <Td>{purchase.supplier?.name ?? "—"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          {ingredient.purchases.length === 0 && (
            <EmptyState message="Todavía no hay compras registradas para este insumo." />
          )}
        </Card>
      </div>
    </div>
  );
}
