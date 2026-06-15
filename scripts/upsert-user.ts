import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const login = process.argv[2] || 'RlyAdmin';
  const password = process.argv[3] || 'Password123#@!';
  const role = (process.argv[4] || 'ADMIN') as Role;

  const email = `${login.toLowerCase()}@test.local`;
  const phone = `+37529${String(Date.now()).slice(-7)}`;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.patient.upsert({
    where: { email },
    create: {
      login,
      email,
      password: hashedPassword,
      name: login,
      phone,
      registration_date: new Date(),
      role,
    },
    update: {
      login,
      password: hashedPassword,
      role,
    },
  });

  console.log(`✅ User upserted: id=${user.id}, login=${user.login}, role=${user.role}, email=${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
