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
      firstName: 'Kennedy',
      email: 'superadmin@example.com',
      password: 'securepassword',
      role: 'VIEWER',
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      action: 'Created Super Admin',
      actorType: 'Admin',
      actorId: superAdmin.id,
      resourceType: 'Admin',
      resourceId: superAdmin.id,
      metadata: { email: superAdmin.email },
    },
  });

  // Seed a User
  const user: any = await prisma.user.create({
    data: {
      firstName: 'John',
      email: 'johndoe@example.com',
    },
  });

  // Log the action
  await prisma.auditLog.create({
    data: {
      action: 'Created User',
      actorType: 'User',
      actorId: user.id,
      resourceId: user.id,
      resourceType: 'User',
      metadata: { email: user.email, dob: user.dob },
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
      actorId: superAdmin.id,
      action: 'Created Form',
      actorType: 'Form',
      resourceId: form.id,
      resourceType: 'Form',
      metadata: { status: form.status },
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
