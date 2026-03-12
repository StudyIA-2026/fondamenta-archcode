import { prisma } from './db';
export async function getUsers() {
  return prisma.user.findMany();
}
export async function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
