import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateMargin, calculateRecipeCost } from "@/lib/costing";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";

export default async function RecetasPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: { name: "asc" },
    include: { recipeItems: { include: { ingredient: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Recetas"
        description="Platos y su costo calculado a partir de los insumos."
        action={
          <Link href="/recetas/nueva">
            <Button>Nueva receta</Button>
          </Link>
        }
      />
      <Card className="p-0">
        <Table>
          <Thead>
            <Tr>
              <Th>Plato</Th>
              <Th>Costo</Th>
              <Th>Precio de venta</Th>
              <Th>Margen</Th>
              <Th>Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {dishes.map((dish) => {
              const cost = calculateRecipeCost(dish.recipeItems);
              const margin = calculateMargin(dish.salePrice, cost);
              return (
                <Tr key={dish.id}>
                  <Td>
                    <Link
                      href={`/recetas/${dish.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {dish.name}
                    </Link>
                  </Td>
                  <Td>{formatCurrency(cost)}</Td>
                  <Td>{formatCurrency(dish.salePrice)}</Td>
                  <Td>
                    {margin == null ? (
                      "—"
                    ) : (
                      <span className={margin >= 0 ? "text-accent" : "text-danger"}>
                        {formatCurrency(margin)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {dish.isActive ? (
                      <Badge tone="success">Activa</Badge>
                    ) : (
                      <Badge tone="neutral">Inactiva</Badge>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {dishes.length === 0 && (
          <EmptyState message="Todavía no hay recetas creadas." />
        )}
      </Card>
    </div>
  );
}
