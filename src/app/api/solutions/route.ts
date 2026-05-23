import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { DEFAULT_SOLUTIONS } from '@/lib/seed-data'

async function seedIfEmpty() {
  const count = await prisma.solution.count()
  if (count === 0) {
    await prisma.solution.createMany({ data: DEFAULT_SOLUTIONS })
  }
}

export async function GET() {
  await seedIfEmpty()
  const solutions = await prisma.solution.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  return NextResponse.json(solutions)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, trademark = '', logoKey = '', sortOrder = 0 } = body
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const solution = await prisma.solution.create({
    data: { name: name.trim(), trademark, logoKey, sortOrder },
  })
  return NextResponse.json(solution)
}
