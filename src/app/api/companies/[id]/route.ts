import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'
import { PrismaNeon } from '@prisma/adapter-neon'

function getPrisma() {
  const adapter = new PrismaNeon({ 
    connectionString: process.env.DATABASE_URL! 
  })
  return new PrismaClient({ adapter } as any)
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = getPrisma()
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: { 
        salaryEntries: { 
          orderBy: { createdAt: 'desc' }, 
          take: 100 
        } 
      },
    })

    if (!company) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const entries = company.salaryEntries
    const avg = (arr: number[]) => 
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0

    const stats = {
      medianTC: median(entries.map(e => e.totalComp)),
      avgBase: avg(entries.map(e => e.baseSalary)),
      avgBonus: avg(entries.map(e => e.bonus)),
      avgStock: avg(entries.map(e => e.stockValue)),
      count: entries.length,
      byLevel: groupBy(entries, 'level'),
      byLocation: groupBy(entries, 'location'),
    }

    return NextResponse.json({ company, stats })
  } catch (err) {
    console.error('[company detail error]', err)
    return NextResponse.json(
      { error: 'Internal server error', detail: String(err) }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

function median(arr: number[]): number {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function groupBy(arr: any[], key: string) {
  return arr.reduce((acc, item) => {
    const k = item[key] || 'Other'
    if (!acc[k]) acc[k] = { count: 0, avgTC: 0, entries: [] }
    acc[k].count++
    acc[k].entries.push(item.totalComp)
    acc[k].avgTC = acc[k].entries.reduce(
      (a: number, b: number) => a + b, 0
    ) / acc[k].count
    return acc
  }, {} as Record<string, any>)
}