import { prisma } from "@/lib/prisma";
import { createIngredient } from "@/actions/ingredients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IngredientForm } from "@/components/insumos/IngredientForm";

export default async function NewIngredientPage() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader
        title="Nuevo insumo"
        description="Registra una materia prima nueva. Si ya la compraste, anota de una vez cuánto y a qué costo."
      />
      <Card className="max-w-lg">
        <IngredientForm action={createIngredient} suppliers={suppliers} />
      </Card>
    </div>
  );
}
