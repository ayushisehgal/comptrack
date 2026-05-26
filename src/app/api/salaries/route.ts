import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getPrisma() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!
  })
  return new PrismaClient({ adapter } as any)
}

const SalarySchema = z.object({
  companyName: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  level: z.string().min(1).max(20),
  location: z.string().min(1).max(100),
  currency: z.enum(['INR', 'USD']).default('INR'),
  baseSalary: z.number().positive(),
  bonus: z.number().min(0).default(0),
  stockValue: z.number().min(0).default(0),
  yearsExp: z.number().int().min(0).max(40).optional(),
})

function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase()
    .replace(/\s+(inc|llc|ltd|limited|corporation|corp|technologies|tech)\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function GET(req: NextRequest) {
  const prisma = getPrisma()
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const company = searchParams.get('company') || ''
    const role = searchParams.get('role') || ''
    const level = searchParams.get('level') || ''
    const location = searchParams.get('location') || ''
    const sortBy = searchParams.get('sortBy') || 'totalComp'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const where: any = {}
    if (company) where.company = { name: { contains: company, mode: 'insensitive' } }
    if (role) where.role = { contains: role, mode: 'insensitive' }
    if (level) where.level = { equals: level, mode: 'insensitive' }
    if (location) where.location = { contains: location, mode: 'insensitive' }

    const [entries, total] = await Promise.all([
      prisma.salaryEntry.findMany({
        where,
        include: { company: { select: { name: true, industry: true } } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salaryEntry.count({ where }),
    ])

    return NextResponse.json({
      entries, total, page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (err) {
    console.error('[salaries GET error]', err)
    return NextResponse.json(
      { error: 'Failed to fetch salaries' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(req: NextRequest) {
  const prisma = getPrisma()
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const parsed = SalarySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const normalizedName = normalizeCompanyName(data.companyName)

    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: data.companyName, mode: 'insensitive' } },
          { aliases: { has: normalizedName } },
        ]
      }
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName.trim(),
          aliases: [normalizedName],
        }
      })
    }

    const totalComp = data.baseSalary + data.bonus + data.stockValue

    const entry = await prisma.salaryEntry.create({
      data: {
        companyId: company.id,
        role: data.role,
        level: data.level,
        location: data.location,
        currency: data.currency,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        stockValue: data.stockValue,
        totalComp,
        yearsExp: data.yearsExp,
        userId: (session?.user as any)?.id || null,
      },
      include: { company: { select: { name: true } } },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[salaries POST error]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}