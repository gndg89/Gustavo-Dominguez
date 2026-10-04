import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/components/ui/Table";
import { formatMoney, paymentMethodLabel } from "@/lib/utils";

export type PaymentBreakdownRow = {
  type: "Venta" | "Compra";
  paymentMethod: string;
  currency: string;
  total: number;
};

export function PaymentBreakdownTable({ rows }: { rows: PaymentBreakdownRow[] }) {
  return (
    <Card className="p-0">
      <CardHeader className="p-5 pb-0">
        <CardTitle>Desglose por forma de pago</CardTitle>
      </CardHeader>
      <Table className="mt-4">
        <Thead>
          <Tr>
            <Th>Tipo</Th>
            <Th>Forma de pago</Th>
            <Th>Moneda</Th>
            <Th>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={`${row.type}-${row.paymentMethod}-${row.currency}`}>
              <Td>{row.type}</Td>
              <Td>{paymentMethodLabel(row.paymentMethod)}</Td>
              <Td>{row.currency === "BS" ? "Bolívares" : "Divisas"}</Td>
              <Td>{formatMoney(row.total, row.currency)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {rows.length === 0 && (
        <EmptyState message="No hay movimientos en este período." />
      )}
    </Card>
  );
}
