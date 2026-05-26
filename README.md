# CompTrack — Compensation Intelligence Platform

**Live URL:** https://comptrack-5nzq.onrender.com  
**GitHub:** https://github.com/ayushisehgal/comptrack  

---

## What is CompTrack?

CompTrack is a structured compensation intelligence platform where engineers can submit and compare salary data by level, role, location, and company.

The core principle — borrowed from Levels.fyi — is that **levels matter more than job titles**. An "SDE-2 at Google" is more meaningful and comparable than "Software Engineer at Google". Every submission is structured around a level (L3, L4, SDE-1, Senior, etc.) which makes cross-company compensation comparison actually meaningful.

---

## Live Features

### 1. Salary Table with Filters
- Filter by company, role, level, and location simultaneously
- Sort by total comp, base salary, or most recent
- Pagination — 20 results per page
- All filtering and sorting done server-side via Prisma queries

### 2. Salary Submission with Validation
- Zod schema validation on the backend — bad data never reaches the database
- Company name normalization — "Google Inc", "google llc", "GOOGLE" all resolve to canonical "Google"
- Total comp auto-calculated as base + bonus + stock — user never inputs it manually
- Missing bonus and stock default to 0 at schema level — totalComp is never NaN or undefined
- Field-level error messages on the frontend

### 3. Company Intelligence Pages
- Aggregate stats per company — Median TC, Avg Base, Avg Bonus, Avg Stock, data point count
- Custom median function (not SQL AVG) — resistant to outlier salaries skewing the data
- Bar chart showing avg total comp broken down by level
- Full entry table for every submission at that company

### 4. Side-by-Side Comparison Tool
- Compare up to 3 companies simultaneously
- Cards showing all compensation metrics per company
- Dynamic bar chart updates as you add or remove companies
- Dropdown disables at 3 selections

### 5. Authentication
- Google OAuth via NextAuth.js
- Submissions linked to user accounts
- Anonymous submissions supported for users who are not signed in

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, TailwindCSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL on Neon (serverless) |
| ORM | Prisma v7 with Neon adapter |
| Auth | NextAuth.js with Google OAuth |
| Charts | Recharts |
| Validation | Zod |
| Deployment | Render |

---

## Architecture
Browser
↓
Next.js 16 Frontend (React + TailwindCSS)
↓
Next.js API Routes
↓
Prisma ORM + Neon Adapter
↓
PostgreSQL on Neon

### API Routes

| Method | Route | Description |
|---|---|---|
| GET | /api/salaries | List with filters, sorting, pagination |
| POST | /api/salaries | Submit new salary entry |
| GET | /api/companies | List all companies with entry counts |
| GET | /api/companies/[id] | Company detail with aggregate stats |
| GET/POST | /api/auth/[...nextauth] | Google OAuth |

---

## Key Engineering Decisions

### 1. Company Normalization
When a user submits "Google Inc", the backend:
1. Strips legal suffixes (Inc, LLC, Ltd, Corp, Technologies)
2. Lowercases and trims the result
3. Matches against the company name AND its aliases array
4. Either links to existing company or creates a new one

This means "Google Inc", "google llc", and "GOOGLE" all map to the same canonical "Google" record — keeping aggregate stats accurate.

```typescript
function normalizeCompanyName(name: string): string {
  return name.trim().toLowerCase()
    .replace(/\s+(inc|llc|ltd|limited|corporation|corp|technologies|tech)\.?$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}
```

### 2. Denormalized totalComp Column
Total comp is stored as a column (`base + bonus + stock`) rather than computed on every query.

**Why:** Enables fast `ORDER BY totalComp` with a simple index scan. Computing it on every request would require a full table scan with a computed expression on every row.

**Why it's safe:** Salary entries are immutable after submission — they are never edited. So the stored value never goes stale.

### 3. Median vs Average
Company pages show Median TC, not Average TC.

**Why:** A few extremely high salaries (staff engineers, VPs) would skew the average and make it unrepresentative of what a typical engineer earns. Median gives a more honest picture.

```typescript
function median(arr: number[]): number {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}
```

### 4. Level-First Schema Design
The `level` field is required on every SalaryEntry. This is a deliberate constraint — without a level, the data is not comparable across companies.

### 5. Next.js 16 params as Promise
In Next.js 16, the `params` object in API routes is now a Promise and must be awaited:

```typescript
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  ...
}
```

This was a breaking change from Next.js 15 that I debugged and fixed.

### 6. Prisma v7 with Neon Adapter
Prisma v7 removed the traditional connection URL from the schema file. Instead, connections are managed via the Neon serverless adapter:

```typescript
function getPrisma() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!
  })
  return new PrismaClient({ adapter } as any)
}
```

---

## Tradeoffs

| Decision | Choice | Tradeoff |
|---|---|---|
| Backend | Next.js API routes | Simple deployment vs scalability |
| Database connections | Neon serverless adapter | Great for serverless, needs PgBouncer at scale |
| Total comp storage | Denormalized column | Fast queries, assumes immutability |
| Duplicate detection | Basic (user-scoped) | Would need stronger deduplication in production |
| Auth | Google OAuth only | Fast to implement, limits signup options |

---

## Competitor Research

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | CompTrack |
|---|---|---|---|---|---|
| Salary structured by level | ✅ L3/L4/L5 | ✅ | ❌ title only | ✅ | ✅ |
| Total comp breakdown | ✅ base+bonus+stock | ✅ | ❌ | partial | ✅ |
| Company name normalization | ✅ | ❌ | partial | partial | ✅ |
| Filters by role/level/location | ✅ | ✅ | ✅ | ✅ | ✅ |
| Company aggregate pages | ✅ median, p25/p75 | ❌ | ✅ | ✅ | ✅ |
| Side-by-side comparison | ✅ | ❌ | ❌ | ❌ | ✅ |
| Auth + user submissions | ✅ | ❌ | ✅ | ✅ | ✅ |
| Duplicate/validation handling | ✅ | ❌ | ❌ | ❌ | ✅ |

### Key Observations

**Why Levels.fyi wins:** It enforces structured levels (L3, L4, L5) instead of free-text titles. This is the single most important design decision — it makes compensation data comparable across companies. CompTrack is built around this same principle.

**Gap in the Indian market:** AmbitionBox and Glassdoor dominate India but neither enforces level-based structure. 6figr has levels but lacks company aggregation and comparison. CompTrack addresses all three gaps.

**What I would build next:** Percentile ranges (p25/p50/p75) per level per company, YoY compensation trend charts, and stronger duplicate detection using submission fingerprinting.

---

## Database Schema

```prisma
model SalaryEntry {
  id          String   @id @default(cuid())
  companyId   String
  role        String
  level       String           // required — core design principle
  location    String
  baseSalary  Float
  bonus       Float    @default(0)
  stockValue  Float    @default(0)
  totalComp   Float            // denormalized for fast sorting
  currency    String   @default("INR")
  yearsExp    Int?
  userId      String?
  createdAt   DateTime @default(now())
}

model Company {
  id       String   @id @default(cuid())
  name     String   @unique    // canonical name
  aliases  String[]            // for normalization matching
  industry String?
  hq       String?
}
```

---

## Local Setup

```bash
git clone https://github.com/ayushisehgal/comptrack.git
cd comptrack
npm install

# Create .env file with:
# DATABASE_URL="your-neon-connection-string"
# NEXTAUTH_SECRET="your-secret"
# NEXTAUTH_URL="http://localhost:3000"
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

npx prisma db push
npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts
npm run dev
```

Open http://localhost:3000

---

## What I Learned

Building this project taught me how modern full stack architecture works end to end — from schema design decisions that affect query performance, to API validation that protects data integrity, to frontend state management that keeps the UI responsive. The most valuable lesson was that good engineering is about making deliberate tradeoffs and being able to explain them clearly.
