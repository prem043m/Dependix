require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const repo = await prisma.repository.findFirst({
    where: { name: 'express' }
  });
  
  if (repo) {
    console.log('Repository ID:', repo.id);
    console.log('Full details:', JSON.stringify(repo, null, 2));
  } else {
    console.log('No repository found');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
