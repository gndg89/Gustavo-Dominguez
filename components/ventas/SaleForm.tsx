"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatCurrency, formatMoney } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

type Dish = { id: string; name: string; salePrice: number | null };

const PAYMENT_METHOD_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "PAGO_MOVIL", label: "Pago móvil" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "ZELLE", label: "Zelle" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
];

export function SaleForm({
  action,
  dishes,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  dishes: Dish[];
}) {
  const sellableDishes = dishes.filter((d) => d.salePrice != null);
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [dishId, setDishId] = useState(sellableDishes[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [currency, setCurrency] = useState("BS");

  const selectedDish = sellableDishes.find((d) => d.id === dishId);
  const total = useMemo(() => {
    const q = parseInt(quantity, 10);
    if (!selectedDish?.salePrice || !q) return null;
    return selectedDish.salePrice * q;
  }, [selectedDish, quantity]);

  const today = new Date().toISOString().slice(0, 10);

  if (sellableDishes.length === 0) {
    return (
      <p className="text-sm text-muted">
        No hay platos con precio de venta definido todavía. Ve a Recetas y asígnale un
        precio a al menos un plato.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="dishId">Plato</Label>
        <Select
          id="dishId"
          name="dishId"
          value={dishId}
          onChange={(e) => setDishId(e.target.value)}
          required
        >
          {sellableDishes.map((dish) => (
            <option key={dish.id} value={dish.id}>
              {dish.name} — {formatCurrency(dish.salePrice)}
            </option>
          ))}
        </Select>
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
          <Input id="saleDate" name="saleDate" type="date" defaultValue={today} required />
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
          <Select id="paymentMethod" name="paymentMethod" defaultValue="EFECTIVO">
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
        {isPending ? "Guardando..." : "Registrar venta"}
      </Button>
    </form>
  );
}
