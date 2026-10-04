import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { DateRangeFilter } from "@/components/contabilidad/DateRangeFilter";
import {
  PaymentBreakdownTable,
  type PaymentBreakdownRow,
} from "@/components/contabilidad/PaymentBreakdownTable";
import { LedgerTable, type LedgerEntry } from "@/components/contabilidad/LedgerTable";

function startOfMonthISO(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function ContabilidadPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const from = params.from || startOfMonthISO();
  const to = params.to || todayISO();

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T23:59:59`);

  const [sales, purchases] = await Promise.all([
    prisma.sale.findMany({
      where: { saleDate: { gte: fromDate, lte: toDate } },
      include: { dish: true },
      orderBy: { saleDate: "desc" },
    }),
    prisma.purchase.findMany({
      where: { purchaseDate: { gte: fromDate, lte: toDate } },
      include: { ingredient: true },
      orderBy: { purchaseDate: "desc" },
    }),
  ]);

  const totals = { BS: { ingresos: 0, gastos: 0 }, USD: { ingresos: 0, gastos: 0 } };
  for (const sale of sales) {
    totals[sale.currency as "BS" | "USD"].ingresos += sale.totalAmount;
  }
  for (const purchase of purchases) {
    totals[purchase.currency as "BS" | "USD"].gastos += purchase.totalCost;
  }

  const breakdownMap = new Map<string, PaymentBreakdownRow>();
  function addToBreakdown(type: "Venta" | "Compra", paymentMethod: string, currency: string, amount: number) {
    const key = `${type}-${paymentMethod}-${currency}`;
    const existing = breakdownMap.get(key);
    if (existing) {
      existing.total += amount;
    } else {
      breakdownMap.set(key, { type, paymentMethod, currency, total: amount });
    }
  }
  for (const sale of sales) {
    addToBreakdown("Venta", sale.paymentMethod, sale.currency, sale.totalAmount);
  }
  for (const purchase of purchases) {
    addToBreakdown("Compra", purchase.paymentMethod, purchase.currency, purchase.totalCost);
  }
  const breakdownRows = Array.from(breakdownMap.values()).sort(
    (a, b) => a.type.localeCompare(b.type) || b.total - a.total,
  );

  const ledgerEntries: LedgerEntry[] = [
    ...sales.map((sale) => ({
      id: `sale-${sale.id}`,
      date: sale.saleDate,
      type: "Venta" as const,
      detail: `${sale.dish.name} x${sale.quantity}`,
      currency: sale.currency,
      paymentMethod: sale.paymentMethod,
      amount: sale.totalAmount,
    })),
    ...purchases.map((purchase) => ({
      id: `purchase-${purchase.id}`,
      date: purchase.purchaseDate,
      type: "Compra" as const,
      detail: purchase.ingredient.name,
      currency: purchase.currency,
      paymentMethod: purchase.paymentMethod,
      amount: purchase.totalCost,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contabilidad"
        description="Ingresos y gastos del negocio, separados por moneda."
      />

      <DateRangeFilter from={from} to={to} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Ingresos Bs" value={formatMoney(totals.BS.ingresos, "BS")} />
        <StatCard label="Gastos Bs" value={formatMoney(totals.BS.gastos, "BS")} />
        <StatCard
          label="Balance Bs"
          value={formatMoney(totals.BS.ingresos - totals.BS.gastos, "BS")}
        />
        <StatCard label="Ingresos Divisas" value={formatMoney(totals.USD.ingresos, "USD")} />
        <StatCard label="Gastos Divisas" value={formatMoney(totals.USD.gastos, "USD")} />
        <StatCard
          label="Balance Divisas"
          value={formatMoney(totals.USD.ingresos - totals.USD.gastos, "USD")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <PaymentBreakdownTable rows={breakdownRows} />
        <LedgerTable entries={ledgerEntries} />
      </div>
    </div>
  );
}
