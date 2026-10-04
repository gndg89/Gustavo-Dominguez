"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ingredientSchema, initialPurchaseSchema } from "@/lib/validations";
import { pricePerUnitFromPurchase } from "@/lib/costing";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

export async function createIngredient(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = ingredientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.ingredient.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) {
    return { error: "Ya existe un insumo con ese nombre" };
  }

  const hasInitialPurchase =
    formData.get("initialQuantity") && formData.get("initialTotalCost");

  let initialPurchase: ReturnType<typeof initialPurchaseSchema.parse> | null = null;
  if (hasInitialPurchase) {
    const parsedPurchase = initialPurchaseSchema.safeParse(Object.fromEntries(formData));
    if (!parsedPurchase.success) {
      return { error: parsedPurchase.error.issues[0]?.message ?? "Datos inválidos" };
    }
    initialPurchase = parsedPurchase.data;
  }

  const ingredient = await prisma.ingredient.create({
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      minStockThreshold: parsed.data.minStockThreshold,
      ...(initialPurchase && {
        stockQuantity: initialPurchase.initialQuantity,
        currentCostPerUnit: pricePerUnitFromPurchase(
          initialPurchase.initialTotalCost,
          initialPurchase.initialQuantity,
        ),
      }),
    },
  });

  if (initialPurchase) {
    await prisma.purchase.create({
      data: {
        ingredientId: ingredient.id,
        supplierId: initialPurchase.initialSupplierId || null,
        quantity: initialPurchase.initialQuantity,
        totalCost: initialPurchase.initialTotalCost,
        pricePerUnit: pricePerUnitFromPurchase(
          initialPurchase.initialTotalCost,
          initialPurchase.initialQuantity,
        ),
        currency: initialPurchase.initialCurrency,
        paymentMethod: initialPurchase.initialPaymentMethod,
        purchaseDate: initialPurchase.initialPurchaseDate,
      },
    });
  }

  revalidatePath("/insumos");
  revalidatePath("/contabilidad");
  redirect("/insumos");
}

export async function updateIngredient(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = ingredientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const existing = await prisma.ingredient.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing && existing.id !== id) {
    return { error: "Ya existe un insumo con ese nombre" };
  }

  await prisma.ingredient.update({
    where: { id },
    data: {
      name: parsed.data.name,
      unit: parsed.data.unit,
      minStockThreshold: parsed.data.minStockThreshold,
    },
  });

  revalidatePath("/insumos");
  revalidatePath(`/insumos/${id}`);
  redirect(`/insumos/${id}`);
}

export async function deleteIngredient(
  id: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const usedInRecipes = await prisma.recipeItem.count({ where: { ingredientId: id } });
  if (usedInRecipes > 0) {
    return {
      error: "Este insumo está usado en una o más recetas. Quítalo de esas recetas antes de borrarlo.",
    };
  }

  await prisma.ingredient.delete({ where: { id } });

  revalidatePath("/insumos");
  revalidatePath("/contabilidad");
  redirect("/insumos");
}
