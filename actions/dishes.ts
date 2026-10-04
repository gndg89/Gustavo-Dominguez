"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";
import { compatibleUnits } from "@/lib/units";
import type { ActionState } from "@/lib/action-state";
import { requireSession } from "@/lib/require-session";

function parseDishFormData(formData: FormData) {
  const itemsJson = formData.get("itemsJson");
  let items: unknown = [];
  try {
    items = itemsJson ? JSON.parse(String(itemsJson)) : [];
  } catch {
    items = [];
  }

  const salePriceRaw = formData.get("salePrice");

  return dishSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    salePrice: salePriceRaw ? salePriceRaw : null,
    isActive: formData.get("isActive") === "on",
    items,
  });
}

async function validateItemUnits(items: { ingredientId: string; unit: string }[]) {
  const ingredientIds = items.map((item) => item.ingredientId);
  const ingredients = await prisma.ingredient.findMany({
    where: { id: { in: ingredientIds } },
  });

  if (ingredients.length !== new Set(ingredientIds).size) {
    return "Hay insumos repetidos o inválidos en la receta";
  }

  const ingredientById = new Map(ingredients.map((ing) => [ing.id, ing]));
  for (const item of items) {
    const ingredient = ingredientById.get(item.ingredientId);
    if (!ingredient || !compatibleUnits(ingredient.unit).includes(item.unit)) {
      return "La unidad de una de las líneas no es compatible con su insumo";
    }
  }

  return null;
}

export async function createDish(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = parseDishFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, description, salePrice, isActive, items } = parsed.data;

  const unitError = await validateItemUnits(items);
  if (unitError) return { error: unitError };

  await prisma.dish.create({
    data: {
      name,
      description: description || null,
      salePrice: salePrice ?? null,
      isActive,
      recipeItems: {
        create: items.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    },
  });

  revalidatePath("/recetas");
  revalidatePath("/dashboard");
  redirect("/recetas");
}

export async function updateDish(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = parseDishFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { name, description, salePrice, isActive, items } = parsed.data;

  const unitError = await validateItemUnits(items);
  if (unitError) return { error: unitError };

  await prisma.$transaction([
    prisma.recipeItem.deleteMany({ where: { dishId: id } }),
    prisma.dish.update({
      where: { id },
      data: {
        name,
        description: description || null,
        salePrice: salePrice ?? null,
        isActive,
        recipeItems: {
          create: items.map((item) => ({
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/recetas");
  revalidatePath(`/recetas/${id}`);
  revalidatePath("/dashboard");
  redirect(`/recetas/${id}`);
}

export async function deleteDish(
  id: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const salesCount = await prisma.sale.count({ where: { dishId: id } });
  if (salesCount > 0) {
    return {
      error: "Esta receta ya tiene ventas registradas. Márcala como inactiva en vez de borrarla.",
    };
  }

  await prisma.dish.delete({ where: { id } });

  revalidatePath("/recetas");
  revalidatePath("/dashboard");
  redirect("/recetas");
}
