const UNIT_LABELS: Record<string, string> = {
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  LITER: "L",
  UNIT: "u",
};

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit;
}

const CURRENCY_LABELS: Record<string, string> = {
  BS: "Bs",
  USD: "$",
};

export function currencyLabel(currency: string): string {
  return CURRENCY_LABELS[currency] ?? currency;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  PAGO_MOVIL: "Pago móvil",
  TRANSFERENCIA: "Transferencia",
  ZELLE: "Zelle",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
};

export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method] ?? method;
}

export function formatMoney(
  value: number | null | undefined,
  currency: string,
): string {
  if (value == null) return "—";
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${currencyLabel(currency)} ${formatted}`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "—";
  const formatted = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `$ ${formatted}`;
}

export function formatQuantity(
  value: number | null | undefined,
  unit?: string,
): string {
  if (value == null) return "—";
  const formatted = new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 3,
  }).format(value);
  return unit ? `${formatted} ${unitLabel(unit)}` : formatted;
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
