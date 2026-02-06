const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('secret', 10);
  const guestPassword = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      name: 'Admin User',
      username: 'admin',
      password: adminPassword,
      isPaid: true,
    },
  });

  await prisma.user.upsert({
    where: { username: 'guest' },
    update: {},
    create: {
      name: 'Guest User',
      username: 'guest',
      password: guestPassword,
      isPaid: false,
    },
  });

  console.log('Seeded users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
