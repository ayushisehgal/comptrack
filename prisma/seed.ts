import { PrismaClient } from '@prisma/client/edge'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter } as any)

const companies = [
  { name: 'Google', aliases: ['google inc', 'alphabet', 'google llc'], industry: 'Tech', hq: 'Mountain View, CA' },
  { name: 'Microsoft', aliases: ['msft', 'microsoft corporation'], industry: 'Tech', hq: 'Redmond, WA' },
  { name: 'Amazon', aliases: ['amazon.com', 'aws', 'amazon web services'], industry: 'Tech', hq: 'Seattle, WA' },
  { name: 'Flipkart', aliases: ['flipkart internet', 'walmart india'], industry: 'E-commerce', hq: 'Bangalore' },
  { name: 'Swiggy', aliases: ['bundl technologies'], industry: 'Food Tech', hq: 'Bangalore' },
  { name: 'Zomato', aliases: ['zomato limited'], industry: 'Food Tech', hq: 'Gurgaon' },
]

const roles = ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Data Scientist', 'Product Manager']
const levels = ['L3', 'L4', 'L5', 'L6', 'SDE-1', 'SDE-2', 'SDE-3']
const locations = ['Bangalore', 'Hyderabad', 'Mumbai', 'Remote', 'Gurgaon']

async function main() {
  console.log('Seeding companies...')

  const createdCompanies = []
  for (const c of companies) {
    const company = await prisma.company.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    })
    createdCompanies.push(company)
    console.log(`✅ Company: ${company.name}`)
  }

  console.log('Seeding salary entries...')

  const entries = []
  for (let i = 0; i < 80; i++) {
    const company = createdCompanies[Math.floor(Math.random() * createdCompanies.length)]
    const base = 800000 + Math.random() * 4000000
    const bonus = base * (0.1 + Math.random() * 0.3)
    const stock = Math.random() > 0.4 ? base * (0.2 + Math.random() * 0.8) : 0

    entries.push({
      companyId: company.id,
      role: roles[Math.floor(Math.random() * roles.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      currency: 'INR',
      baseSalary: Math.round(base),
      bonus: Math.round(bonus),
      stockValue: Math.round(stock),
      totalComp: Math.round(base + bonus + stock),
      yearsExp: Math.floor(Math.random() * 12) + 1,
      source: 'seed',
    })
  }

  await prisma.salaryEntry.createMany({ data: entries })
  console.log(`✅ Seeded ${entries.length} salary entries`)
}

main()
  .catch(e => { console.error('Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())