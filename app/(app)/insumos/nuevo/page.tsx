import { createIngredient } from "@/actions/ingredients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IngredientForm } from "@/components/insumos/IngredientForm";

export default function NewIngredientPage() {
  return (
    <div>
      <PageHeader title="Nuevo insumo" description="Registra una materia prima nueva." />
      <Card className="max-w-lg">
        <IngredientForm action={createIngredient} />
      </Card>
    </div>
  );
}
