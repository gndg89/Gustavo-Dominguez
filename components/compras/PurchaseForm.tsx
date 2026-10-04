"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatMoney, unitLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

type Supplier = { id: string; name: string };

const PAYMENT_METHOD_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "PAGO_MOVIL", label: "Pago móvil" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export function PurchaseForm({
  action,
  ingredientUnit,
  suppliers,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  ingredientUnit: string;
  suppliers: Supplier[];
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currency, setCurrency] = useState("BS");

  const pricePerUnit = useMemo(() => {
    const q = parseFloat(quantity);
    const c = parseFloat(totalCost);
    if (!q || !c || q <= 0) return null;
    return c / q;
  }, [quantity, totalCost]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">Cantidad comprada ({unitLabel(ingredientUnit)})</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.001"
            min="0.001"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="totalCost">Costo total pagado</Label>
          <Input
            id="totalCost"
            name="totalCost"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
          />
        </div>
      </div>

      {pricePerUnit != null && (
        <p className="text-sm text-muted">
          ≈ {formatMoney(pricePerUnit, currency)} por {unitLabel(ingredientUnit)}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="currency">Moneda</Label>
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
          <Select id="paymentMethod" name="paymentMethod" defaultValue="EFECTIVO">
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="supplierId">Proveedor (opcional)</Label>
        <Select id="supplierId" name="supplierId" defaultValue="">
          <option value="">Sin proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="purchaseDate">Fecha de compra</Label>
        <Input id="purchaseDate" name="purchaseDate" type="date" defaultValue={today} required />
      </div>

      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Input id="notes" name="notes" placeholder="Ej. compra de temporada" />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
