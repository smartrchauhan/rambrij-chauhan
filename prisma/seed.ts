import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "change-this-password-123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin already exists:", email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Ram Brij",
      email,
      passwordHash: await hash(password, 12),
      role: "ADMIN",
    },
  });

  console.log("Admin created:", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
