import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shouldReset = process.env.RESET_DB === 'true'; // Use an environment variable for control

  if (shouldReset) {
    console.log('Resetting database...');
    await prisma.auditLog.deleteMany();
    await prisma.formHistory.deleteMany();
    await prisma.form.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.deleteMany();
    console.log('Database reset complete.');
  }
  console.log('Seeding database...');

  // Seed a Super Admin
  const superAdmin: any = await prisma.user.create({
    data: {
      fullName: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'securepassword',
      role: 'VIEWER',
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'Created Super Admin',
      entityType: 'Admin',
      entityId: superAdmin.id,
      details: { email: superAdmin.email },
    },
  });

  // Seed a User
  const user: any = await prisma.user.create({
    data: {
      fullName: 'John Doe',
      email: 'johndoe@example.com',
      dob: new Date('1990-01-01'),
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'Created User',
      entityType: 'User',
      entityId: user.id,
      details: { email: user.email, dob: user.dob },
    },
  });

  // Seed a Form for the User
  const form: any = await prisma.form.create({
    data: {
      userId: user.id,
      status: 'IN_PROGRESS',
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: 'Created Form',
      entityType: 'Form',
      entityId: form.id,
      details: { status: form.status },
    },
  });

  // Create Form History
  await prisma.formHistory.create({
    data: {
      formId: form.id,
      updatedBy: superAdmin.id,
      changes: { status: { oldValue: null, newValue: 'IN_PROGRESS' } },
    },
  });

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
