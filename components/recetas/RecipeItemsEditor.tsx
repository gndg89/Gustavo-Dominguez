"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { calculateDishCost } from "@/lib/costing";
import { formatCurrency, unitLabel } from "@/lib/utils";

export type IngredientOption = {
  id: string;
  name: string;
  unit: string;
  currentCostPerUnit: number;
};

type Row = { key: string; ingredientId: string; quantity: string };

export function RecipeItemsEditor({
  ingredients,
  defaultItems = [],
  onCostChange,
}: {
  ingredients: IngredientOption[];
  defaultItems?: { ingredientId: string; quantity: number }[];
  onCostChange?: (cost: number) => void;
}) {
  const reactId = useId();
  const [rows, setRows] = useState<Row[]>(() =>
    defaultItems.length > 0
      ? defaultItems.map((item, i) => ({
          key: `${reactId}-${i}`,
          ingredientId: item.ingredientId,
          quantity: String(item.quantity),
        }))
      : [{ key: `${reactId}-0`, ingredientId: ingredients[0]?.id ?? "", quantity: "" }],
  );

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((i) => [i.id, i])),
    [ingredients],
  );

  const validItems = rows
    .filter((row) => row.ingredientId && parseFloat(row.quantity) > 0)
    .map((row) => ({
      ingredientId: row.ingredientId,
      quantity: parseFloat(row.quantity),
    }));

  const totalCost = calculateDishCost(
    validItems.map((item) => ({
      quantity: item.quantity,
      costPerUnit: ingredientMap.get(item.ingredientId)?.currentCostPerUnit ?? 0,
    })),
  );

  useEffect(() => {
    onCostChange?.(totalCost);
  }, [totalCost, onCostChange]);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { key: `${reactId}-${prev.length}-${Date.now()}`, ingredientId: ingredients[0]?.id ?? "", quantity: "" },
    ]);
  }

  function removeRow(key: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="itemsJson" value={JSON.stringify(validItems)} />

      {rows.map((row) => {
        const ingredient = ingredientMap.get(row.ingredientId);
        const lineCost = ingredient
          ? (parseFloat(row.quantity) || 0) * ingredient.currentCostPerUnit
          : 0;
        return (
          <div key={row.key} className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                value={row.ingredientId}
                onChange={(e) => updateRow(row.key, { ingredientId: e.target.value })}
              >
                {ingredients.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-28">
              <Input
                type="number"
                step="0.001"
                min="0"
                placeholder={ingredient ? unitLabel(ingredient.unit) : "cant."}
                value={row.quantity}
                onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
              />
            </div>
            <div className="w-24 text-right text-sm text-muted">
              {formatCurrency(lineCost)}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeRow(row.key)}
              aria-label="Quitar insumo"
            >
              ✕
            </Button>
          </div>
        );
      })}

      <Button type="button" variant="secondary" onClick={addRow}>
        + Agregar insumo
      </Button>

      <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
        <span className="text-sm font-medium text-foreground">Costo total del plato</span>
        <span className="text-lg font-bold text-foreground">{formatCurrency(totalCost)}</span>
      </div>
    </div>
  );
}
