"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { dishSchema } from "@/lib/validations";
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

  const ingredientIds = items.map((item) => item.ingredientId);
  const existingCount = await prisma.ingredient.count({
    where: { id: { in: ingredientIds } },
  });
  if (existingCount !== new Set(ingredientIds).size) {
    return { error: "Hay insumos repetidos o inválidos en la receta" };
  }

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

  const ingredientIds = items.map((item) => item.ingredientId);
  const existingCount = await prisma.ingredient.count({
    where: { id: { in: ingredientIds } },
  });
  if (existingCount !== new Set(ingredientIds).size) {
    return { error: "Hay insumos repetidos o inválidos en la receta" };
  }

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
