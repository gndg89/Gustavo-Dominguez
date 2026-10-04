import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    console.log("Ya existen usuarios, no se crea un admin por defecto.");
    return;
  }

  const email = process.env.SEED_ADMIN_EMAIL || "admin@cocina.local";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin1234";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name: "Administrador", email, passwordHash, role: "ADMIN" },
  });

  console.log(`Usuario admin creado: ${email} / contraseña: ${password}`);
  console.log("Cámbiala apenas inicies sesión.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
