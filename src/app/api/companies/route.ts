import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: { _count: { select: { salaryEntries: true } } },
      orderBy: { salaryEntries: { _count: 'desc' } },
      take: 50,
    })
    return NextResponse.json(companies)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}
