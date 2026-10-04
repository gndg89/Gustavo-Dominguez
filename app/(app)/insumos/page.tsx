import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMoney, formatQuantity, unitLabel } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { deleteIngredient } from "@/actions/ingredients";

export default async function InsumosPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    include: {
      purchases: {
        orderBy: { purchaseDate: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Insumos"
        description="Materia prima, su última compra y el costo de referencia por unidad."
        action={
          <Link href="/insumos/nuevo">
            <Button>Nuevo insumo</Button>
          </Link>
        }
      />
      <Card className="p-0">
        <Table>
          <Thead>
            <Tr>
              <Th>Nombre</Th>
              <Th>Unidad</Th>
              <Th>Última compra</Th>
              <Th>Costo actual</Th>
              <Th>Stock</Th>
              <Th>Estado</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {ingredients.map((ingredient) => {
              const low = ingredient.stockQuantity < ingredient.minStockThreshold;
              const lastPurchase = ingredient.purchases[0];
              return (
                <Tr key={ingredient.id}>
                  <Td>
                    <Link
                      href={`/insumos/${ingredient.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {ingredient.name}
                    </Link>
                  </Td>
                  <Td>{unitLabel(ingredient.unit)}</Td>
                  <Td>
                    {lastPurchase ? (
                      <span>
                        {formatQuantity(lastPurchase.quantity, ingredient.unit)} ·{" "}
                        {formatMoney(lastPurchase.totalCost, lastPurchase.currency)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td>
                    {formatMoney(ingredient.currentCostPerUnit, lastPurchase?.currency ?? "BS")}{" "}
                    / {unitLabel(ingredient.unit)}
                  </Td>
                  <Td>{formatQuantity(ingredient.stockQuantity, ingredient.unit)}</Td>
                  <Td>
                    {low ? (
                      <Badge tone="danger">Stock bajo</Badge>
                    ) : (
                      <Badge tone="success">OK</Badge>
                    )}
                  </Td>
                  <Td>
                    <DeleteButton
                      action={deleteIngredient.bind(null, ingredient.id)}
                      confirmMessage={`¿Borrar el insumo "${ingredient.name}"? Esto también borra su historial de compras.`}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {ingredients.length === 0 && (
          <EmptyState message="Todavía no hay insumos registrados." />
        )}
      </Card>
    </div>
  );
}
