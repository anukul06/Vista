import { prisma } from '../config/prisma.js'

export const adminRepository = {
  findByEmail(email: string) {
    return prisma.admin.findUnique({ where: { email } })
  },
  findById(id: string) {
    return prisma.admin.findUnique({ where: { id } })
  },
}
