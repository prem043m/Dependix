import { prisma } from './src/database/prisma';

async function main() {
  const repo = await prisma.repository.findFirst({
    where: { name: 'express' },
    include: { analysis: true }
  });
  
  if (repo) {
    console.log('Repository ID:', repo.id);
    console.log('Name:', repo.name);
    console.log('Owner:', repo.owner);
    console.log('Has Analysis:', !!repo.analysis);
  } else {
    console.log('No repository found, listing all:');
    const all = await prisma.repository.findMany();
    console.log(all.map(r => ({ id: r.id, name: r.name, owner: r.owner })));
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
