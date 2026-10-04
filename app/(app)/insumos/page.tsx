import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatQuantity, unitLabel } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";

export default async function InsumosPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Insumos"
        description="Materia prima y su costo de referencia por unidad."
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
              <Th>Costo actual</Th>
              <Th>Stock</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {ingredients.map((ingredient) => {
              const low = ingredient.stockQuantity < ingredient.minStockThreshold;
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
                    {formatCurrency(ingredient.currentCostPerUnit)} /{" "}
                    {unitLabel(ingredient.unit)}
                  </Td>
                  <Td>{formatQuantity(ingredient.stockQuantity, ingredient.unit)}</Td>
                  <Td>
                    {low ? (
                      <Badge tone="danger">Stock bajo</Badge>
                    ) : (
                      <Badge tone="success">OK</Badge>
                    )}
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
