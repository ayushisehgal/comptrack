import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SalarySchema, normalizeCompanyName } from '@/lib/utils'

/**
 * ✅ POST → Create salary entry (AUTH REQUIRED)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // 🔒 protect POST
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // ✅ validate input
    const parsed = SalarySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const normalizedName = normalizeCompanyName(data.companyName)

    // ✅ find or create company
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { equals: data.companyName, mode: 'insensitive' } },
          { aliases: { has: normalizedName } },
        ],
      },
    })

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: data.companyName.trim(),
          aliases: [normalizedName],
        },
      })
    }

    // ✅ compute total compensation
    const totalComp =
      data.baseSalary + data.bonus + data.stockValue

    // ✅ create salary entry
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
        yearsExp: data.yearsExp ?? null,
        userId: (session.user as any)?.id ?? null,
      },
      include: {
        company: { select: { name: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })

  } catch (err) {
    console.error('[POST salaries error]', err)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


/**
 * ✅ GET → Fetch salaries (PUBLIC)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // ✅ fetch paginated entries
    const entries = await prisma.salaryEntry.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        company: {
          select: { name: true },
        },
      },
    })

    // ✅ total count for pagination
    const total = await prisma.salaryEntry.count()

    // ✅ IMPORTANT: match frontend format
    return NextResponse.json({
      entries,
      total,
    })

  } catch (error) {
    console.error('[GET salaries error]', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}