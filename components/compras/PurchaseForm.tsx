"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { FormMessage } from "@/components/ui/FormMessage";
import { formatCurrency, unitLabel } from "@/lib/utils";
import type { ActionState } from "@/lib/action-state";

type Ingredient = { id: string; name: string; unit: string };
type Supplier = { id: string; name: string };

export function PurchaseForm({
  action,
  ingredients,
  suppliers,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  ingredients: Ingredient[];
  suppliers: Supplier[];
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [ingredientId, setIngredientId] = useState(ingredients[0]?.id ?? "");
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");

  const selectedIngredient = ingredients.find((i) => i.id === ingredientId);

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

      <div>
        <Label htmlFor="ingredientId">Insumo</Label>
        <Select
          id="ingredientId"
          name="ingredientId"
          value={ingredientId}
          onChange={(e) => setIngredientId(e.target.value)}
          required
        >
          {ingredients.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.name} ({unitLabel(ing.unit)})
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantity">
            Cantidad comprada {selectedIngredient ? `(${unitLabel(selectedIngredient.unit)})` : ""}
          </Label>
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

      {pricePerUnit != null && selectedIngredient && (
        <p className="text-sm text-muted">
          ≈ {formatCurrency(pricePerUnit)} por {unitLabel(selectedIngredient.unit)}
        </p>
      )}

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

      <Button type="submit" disabled={isPending || ingredients.length === 0}>
        {isPending ? "Guardando..." : "Registrar compra"}
      </Button>
    </form>
  );
}
