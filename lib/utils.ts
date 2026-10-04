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
