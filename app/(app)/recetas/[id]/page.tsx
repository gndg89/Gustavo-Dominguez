import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { calculateDishCost, calculateMargin } from "@/lib/costing";
import { formatCurrency } from "@/lib/utils";
import { updateDish } from "@/actions/dishes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DishForm } from "@/components/recetas/DishForm";

export default async function DishDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [dish, ingredients] = await Promise.all([
    prisma.dish.findUnique({
      where: { id },
      include: { recipeItems: { include: { ingredient: true } } },
    }),
    prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, unit: true, currentCostPerUnit: true },
    }),
  ]);

  if (!dish) notFound();

  const cost = calculateDishCost(
    dish.recipeItems.map((item) => ({
      quantity: item.quantity,
      costPerUnit: item.ingredient.currentCostPerUnit,
    })),
  );
  const margin = calculateMargin(dish.salePrice, cost);

  const updateAction = updateDish.bind(null, dish.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dish.name}
        description={`Costo actual: ${formatCurrency(cost)} · Precio: ${formatCurrency(dish.salePrice)} · Margen: ${
          margin == null ? "—" : formatCurrency(margin)
        }`}
      />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Editar receta</CardTitle>
        </CardHeader>
        <DishForm
          action={updateAction}
          ingredients={ingredients}
          defaultValues={{
            name: dish.name,
            description: dish.description,
            salePrice: dish.salePrice,
            isActive: dish.isActive,
            items: dish.recipeItems.map((item) => ({
              ingredientId: item.ingredientId,
              quantity: item.quantity,
            })),
          }}
          submitLabel="Guardar cambios"
        />
      </Card>
    </div>
  );
}
