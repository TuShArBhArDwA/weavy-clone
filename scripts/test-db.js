
const { PrismaClient } = require('@prisma/client');

async function main() {
    console.log('Testing database connection...');
    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        const count = await prisma.user.count();
        console.log(`User count: ${count}`);

        const workflowCount = await prisma.workflow.count();
        console.log(`Workflow count: ${workflowCount}`);

    } catch (e) {
        console.error('Database connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
