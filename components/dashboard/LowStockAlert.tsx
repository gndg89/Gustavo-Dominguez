import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatQuantity } from "@/lib/utils";

export type LowStockIngredient = {
  id: string;
  name: string;
  unit: string;
  stockQuantity: number;
  minStockThreshold: number;
};

export function LowStockAlert({ ingredients }: { ingredients: LowStockIngredient[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insumos con stock bajo</CardTitle>
        {ingredients.length > 0 && <Badge tone="danger">{ingredients.length}</Badge>}
      </CardHeader>
      {ingredients.length === 0 ? (
        <p className="text-sm text-muted">Todo el stock está por encima del mínimo.</p>
      ) : (
        <ul className="space-y-2">
          {ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center justify-between text-sm">
              <Link href={`/insumos/${ingredient.id}`} className="font-medium text-foreground hover:underline">
                {ingredient.name}
              </Link>
              <span className="text-muted">
                {formatQuantity(ingredient.stockQuantity, ingredient.unit)} / mín.{" "}
                {formatQuantity(ingredient.minStockThreshold, ingredient.unit)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
