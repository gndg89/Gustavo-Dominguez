"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatMoney } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

const PAYMENT_METHOD_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "PAGO_MOVIL", label: "Pago móvil" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export function SaleEditForm({
  action,
  dishName,
  unitPrice,
  defaultValues,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dishName: string;
  unitPrice: number;
  defaultValues: {
    quantity: number;
    currency: string;
    paymentMethod: string;
    saleDate: Date;
  };
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [quantity, setQuantity] = useState(String(defaultValues.quantity));
  const [currency, setCurrency] = useState(defaultValues.currency);

  const total = useMemo(() => {
    const q = parseInt(quantity, 10);
    if (!q) return null;
    return unitPrice * q;
  }, [quantity, unitPrice]);

  const saleDateValue = defaultValues.saleDate.toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />

      <div>
        <Label>Plato</Label>
        <p className="rounded-lg bg-background px-3 py-2 text-sm text-foreground">
          {dishName} — {formatMoney(unitPrice, currency)} c/u
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Cantidad vendida</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="saleDate">Fecha</Label>
          <Input
            id="saleDate"
            name="saleDate"
            type="date"
            defaultValue={saleDateValue}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Moneda recibida</Label>
          <Select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="BS">Bolívares (Bs)</option>
            <option value="USD">Divisas ($)</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentMethod">Forma de pago</Label>
          <Select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={defaultValues.paymentMethod}
          >
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {total != null && (
        <p className="text-sm text-muted">
          Total de la venta:{" "}
          <span className="font-medium text-foreground">{formatMoney(total, currency)}</span>
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
