import { PrismaClient } from "./generated/index.js"; 

// Prisma Client instance oluşturuluyor, bunu DB işlemleri için kullanacağız
const prisma = new PrismaClient();

export default prisma;
