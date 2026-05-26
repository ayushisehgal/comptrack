import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

function getPrisma() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!
  })
  return new PrismaClient({ adapter } as any)
}

export async function GET() {
  const prisma = getPrisma()
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { salaryEntries: true } } },
      orderBy: { salaryEntries: { _count: 'desc' } },
      take: 50,
    })
    return NextResponse.json(companies)
  } catch (err) {
    console.error('[companies list error]', err)
    return NextResponse.json(
      { error: 'Failed to fetch companies', detail: String(err) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}