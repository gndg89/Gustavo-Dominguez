import { prisma } from "@/lib/prisma";
import { calculateDishCost, calculateMargin } from "@/lib/costing";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { TopDishesTable, type DishMargin } from "@/components/dashboard/TopDishesTable";
import { LowStockAlert } from "@/components/dashboard/LowStockAlert";

export default async function DashboardPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [dishes, ingredients, activeDishCount, monthPurchases, allTimePurchases, monthSales] =
    await Promise.all([
      prisma.dish.findMany({
        where: { isActive: true, salePrice: { not: null } },
        include: { recipeItems: { include: { ingredient: true } } },
      }),
      prisma.ingredient.findMany({ orderBy: { name: "asc" } }),
      prisma.dish.count({ where: { isActive: true } }),
      prisma.purchase.aggregate({
        _sum: { totalCost: true },
        where: { purchaseDate: { gte: startOfMonth } },
      }),
      prisma.purchase.aggregate({ _sum: { totalCost: true } }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: { saleDate: { gte: startOfMonth } },
      }),
    ]);

  const dishMargins: DishMargin[] = dishes
    .map((dish) => {
      const cost = calculateDishCost(
        dish.recipeItems.map((item) => ({
          quantity: item.quantity,
          costPerUnit: item.ingredient.currentCostPerUnit,
        })),
      );
      const margin = calculateMargin(dish.salePrice, cost) ?? 0;
      return { id: dish.id, name: dish.name, cost, salePrice: dish.salePrice as number, margin };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  const lowStockIngredients = ingredients.filter(
    (ingredient) => ingredient.stockQuantity < ingredient.minStockThreshold,
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Resumen de la operación." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gasto en insumos (este mes)"
          value={formatCurrency(monthPurchases._sum.totalCost ?? 0)}
          hint={`Histórico: ${formatCurrency(allTimePurchases._sum.totalCost ?? 0)}`}
        />
        <StatCard
          label="Ventas (este mes)"
          value={formatCurrency(monthSales._sum.totalAmount ?? 0)}
        />
        <StatCard label="Recetas activas" value={String(activeDishCount)} />
        <StatCard
          label="Insumos con stock bajo"
          value={String(lowStockIngredients.length)}
          hint={`de ${ingredients.length} insumos registrados`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TopDishesTable dishes={dishMargins} />
        <LowStockAlert ingredients={lowStockIngredients} />
      </div>
    </div>
  );
}
