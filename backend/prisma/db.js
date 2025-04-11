//File to setup and export a prisma instance
import pkg from "@prisma/client"

const { PrismaClient } = pkg
const prisma = new PrismaClient()

export default prisma