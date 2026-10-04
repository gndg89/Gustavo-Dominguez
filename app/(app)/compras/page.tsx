import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatQuantity } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";

export default async function ComprasPage() {
  const purchases = await prisma.purchase.findMany({
    orderBy: { purchaseDate: "desc" },
    include: { ingredient: true, supplier: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Historial de compras de materia prima."
        action={
          <Link href="/compras/nueva">
            <Button>Nueva compra</Button>
          </Link>
        }
      />
      <Card className="p-0">
        <Table>
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Insumo</Th>
              <Th>Cantidad</Th>
              <Th>Costo total</Th>
              <Th>Precio/unidad</Th>
              <Th>Proveedor</Th>
            </Tr>
          </Thead>
          <Tbody>
            {purchases.map((purchase) => (
              <Tr key={purchase.id}>
                <Td>{formatDate(purchase.purchaseDate)}</Td>
                <Td>
                  <Link
                    href={`/insumos/${purchase.ingredientId}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {purchase.ingredient.name}
                  </Link>
                </Td>
                <Td>{formatQuantity(purchase.quantity, purchase.ingredient.unit)}</Td>
                <Td>{formatCurrency(purchase.totalCost)}</Td>
                <Td>{formatCurrency(purchase.pricePerUnit)}</Td>
                <Td>{purchase.supplier?.name ?? "—"}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {purchases.length === 0 && (
          <EmptyState message="Todavía no hay compras registradas." />
        )}
      </Card>
    </div>
  );
}
