require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        const workflows = await prisma.workflow.findMany({
            select: {
                id: true,
                name: true,
                userId: true,
                createdAt: true
            }
        });
        console.log("Workflows found:", workflows.length);
        console.log(JSON.stringify(workflows, null, 2));
    } catch (error) {
        console.error("Error connecting to database:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
