import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { formatDate, formatMoney, paymentMethodLabel } from "@/lib/utils";

export type LedgerEntry = {
  id: string;
  date: Date;
  type: "Venta" | "Compra";
  detail: string;
  currency: string;
  paymentMethod: string;
  amount: number;
};

export function LedgerTable({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card className="p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Libro de movimientos</CardTitle>
      </CardHeader>
      <Table className="mt-4">
        <Thead>
          <Tr>
            <Th>Fecha</Th>
            <Th>Tipo</Th>
            <Th>Detalle</Th>
            <Th>Moneda</Th>
            <Th>Forma de pago</Th>
            <Th>Monto</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <Tr key={entry.id}>
              <Td>{formatDate(entry.date)}</Td>
              <Td>
                <Badge tone={entry.type === "Venta" ? "success" : "warning"}>
                  {entry.type}
                </Badge>
              </Td>
              <Td>{entry.detail}</Td>
              <Td>{entry.currency === "BS" ? "Bolívares" : "Divisas"}</Td>
              <Td>{paymentMethodLabel(entry.paymentMethod)}</Td>
              <Td>{formatMoney(entry.amount, entry.currency)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {entries.length === 0 && (
        <EmptyState message="No hay movimientos en este período." />
      )}
    </Card>
  );
}
