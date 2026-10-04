import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = "admin1234";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@cocina.local" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@cocina.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const supplierVerduleria = await prisma.supplier.upsert({
    where: { id: "seed-supplier-verduleria" },
    update: {},
    create: {
      id: "seed-supplier-verduleria",
      name: "Verdulería Don José",
      phone: "555-0101",
    },
  });

  const supplierDistribuidora = await prisma.supplier.upsert({
    where: { id: "seed-supplier-distribuidora" },
    update: {},
    create: {
      id: "seed-supplier-distribuidora",
      name: "Distribuidora Central",
      phone: "555-0202",
    },
  });

  const ingredientsData = [
    { id: "seed-ing-tomate", name: "Tomate", quantity: 10, totalCost: 80000 },
    { id: "seed-ing-pimenton", name: "Pimentón", quantity: 8, totalCost: 72000 },
    { id: "seed-ing-queso", name: "Queso", quantity: 5, totalCost: 150000 },
  ];

  const ingredients: Record<string, { id: string }> = {};

  for (const data of ingredientsData) {
    const ingredient = await prisma.ingredient.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        name: data.name,
        unit: "KILOGRAM",
        minStockThreshold: 2,
        currentCostPerUnit: data.totalCost / data.quantity,
        stockQuantity: data.quantity,
      },
    });
    ingredients[data.id] = ingredient;

    await prisma.purchase.upsert({
      where: { id: `${data.id}-purchase-1` },
      update: {},
      create: {
        id: `${data.id}-purchase-1`,
        ingredientId: ingredient.id,
        supplierId: supplierVerduleria.id,
        quantity: data.quantity,
        totalCost: data.totalCost,
        pricePerUnit: data.totalCost / data.quantity,
        currency: "BS",
        paymentMethod: "TRANSFERENCIA",
      },
    });
  }

  const dish = await prisma.dish.upsert({
    where: { id: "seed-dish-ensalada" },
    update: {},
    create: {
      id: "seed-dish-ensalada",
      name: "Ensalada de tomate y pimentón",
      description: "Ensalada fresca con tomate, pimentón y queso",
      salePrice: 18000,
      isActive: true,
      recipeItems: {
        create: [
          { ingredientId: ingredients["seed-ing-tomate"].id, quantity: 200, unit: "GRAM" },
          { ingredientId: ingredients["seed-ing-pimenton"].id, quantity: 150, unit: "GRAM" },
          { ingredientId: ingredients["seed-ing-queso"].id, quantity: 0.1, unit: "KILOGRAM" },
        ],
      },
    },
  });

  await prisma.sale.upsert({
    where: { id: "seed-sale-1" },
    update: {},
    create: {
      id: "seed-sale-1",
      dishId: dish.id,
      userId: admin.id,
      quantity: 2,
      unitPrice: 18000,
      unitCost: 0.2 * 8000 + 0.15 * 9000 + 0.1 * 30000,
      totalAmount: 36000,
      currency: "BS",
      paymentMethod: "EFECTIVO",
    },
  });

  console.log("Seed completo.");
  console.log(`Usuario admin: ${admin.email} / contraseña: ${adminPassword}`);
  console.log(`Proveedores: ${supplierVerduleria.name}, ${supplierDistribuidora.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
