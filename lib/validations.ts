import { z } from "zod";

export const unitEnum = z.enum([
  "GRAM",
  "KILOGRAM",
  "MILLILITER",
  "LITER",
  "UNIT",
]);

export const currencyEnum = z.enum(["BS", "USD"]);

export const paymentMethodEnum = z.enum([
  "EFECTIVO",
  "PAGO_MOVIL",
  "TRANSFERENCIA",
  "ZELLE",
  "TARJETA",
  "OTRO",
]);

export const ingredientSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto"),
  unit: unitEnum,
  minStockThreshold: z.coerce.number().min(0).default(0),
});

export const purchaseSchema = z.object({
  supplierId: z.string().optional().nullable(),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  totalCost: z.coerce.number().positive("El costo debe ser mayor a 0"),
  currency: currencyEnum,
  paymentMethod: paymentMethodEnum,
  purchaseDate: z.coerce.date(),
  notes: z.string().trim().optional(),
});

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto"),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().trim().optional(),
});

export const recipeItemInputSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: unitEnum,
});

export const dishSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto"),
  description: z.string().trim().optional(),
  salePrice: z.coerce.number().positive().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  items: z
    .array(recipeItemInputSchema)
    .min(1, "Agrega al menos un insumo a la receta"),
});

export const saleSchema = z.object({
  dishId: z.string().min(1, "Selecciona un plato"),
  quantity: z.coerce.number().int().positive().default(1),
  currency: currencyEnum,
  paymentMethod: paymentMethodEnum,
  saleDate: z.coerce.date(),
});

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "El nombre es muy corto"),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
