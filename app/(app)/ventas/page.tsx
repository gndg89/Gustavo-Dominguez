import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateMargin } from "@/lib/costing";
import { formatDate, formatMoney, paymentMethodLabel } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";

export default async function VentasPage() {
  const sales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    include: { dish: true, user: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Ventas"
        description="Ventas registradas, con el precio y costo congelados al momento de vender."
        action={
          <Link href="/ventas/nueva">
            <Button>Nueva venta</Button>
          </Link>
        }
      />
      <Card className="p-0">
        <Table>
          <Thead>
            <Tr>
              <Th>Fecha</Th>
              <Th>Plato</Th>
              <Th>Cant.</Th>
              <Th>Precio unit.</Th>
              <Th>Costo unit.</Th>
              <Th>Margen</Th>
              <Th>Total</Th>
              <Th>Forma de pago</Th>
              <Th>Registrada por</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sales.map((sale) => {
              const margin = calculateMargin(sale.unitPrice, sale.unitCost);
              return (
                <Tr key={sale.id}>
                  <Td>{formatDate(sale.saleDate)}</Td>
                  <Td className="font-medium text-foreground">{sale.dish.name}</Td>
                  <Td>{sale.quantity}</Td>
                  <Td>{formatMoney(sale.unitPrice, sale.currency)}</Td>
                  <Td>{formatMoney(sale.unitCost, sale.currency)}</Td>
                  <Td>
                    <span className={margin != null && margin >= 0 ? "text-accent" : "text-danger"}>
                      {formatMoney(margin, sale.currency)}
                    </span>
                  </Td>
                  <Td>{formatMoney(sale.totalAmount, sale.currency)}</Td>
                  <Td>{paymentMethodLabel(sale.paymentMethod)}</Td>
                  <Td>{sale.user?.name ?? "—"}</Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
        {sales.length === 0 && <EmptyState message="Todavía no hay ventas registradas." />}
      </Card>
    </div>
  );
}
