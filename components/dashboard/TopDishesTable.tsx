import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";

export type DishMargin = {
  id: string;
  name: string;
  cost: number;
  salePrice: number;
  margin: number;
};

export function TopDishesTable({ dishes }: { dishes: DishMargin[] }) {
  return (
    <Card className="p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Platos más rentables</CardTitle>
      </CardHeader>
      <Table className="mt-4">
        <Thead>
          <Tr>
            <Th>Plato</Th>
            <Th>Costo</Th>
            <Th>Precio</Th>
            <Th>Margen</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dishes.map((dish) => (
            <Tr key={dish.id}>
              <Td>
                <Link href={`/recetas/${dish.id}`} className="font-medium text-foreground hover:underline">
                  {dish.name}
                </Link>
              </Td>
              <Td>{formatCurrency(dish.cost)}</Td>
              <Td>{formatCurrency(dish.salePrice)}</Td>
              <Td className="font-medium text-accent">{formatCurrency(dish.margin)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {dishes.length === 0 && (
        <EmptyState message="Define un precio de venta en tus recetas para ver el margen." />
      )}
    </Card>
  );
}
