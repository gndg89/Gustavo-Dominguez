import { prisma } from "@/lib/prisma";
import { createDish } from "@/actions/dishes";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { DishForm } from "@/components/recetas/DishForm";

export default async function NewDishPage() {
  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, unit: true, currentCostPerUnit: true },
  });

  return (
    <div>
      <PageHeader
        title="Nueva receta"
        description="Agrega los insumos y sus cantidades para calcular el costo del plato."
      />
      <Card className="max-w-xl">
        <DishForm action={createDish} ingredients={ingredients} />
      </Card>
    </div>
  );
}
