import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { name, trademark, logoKey, active, sortOrder } = body
  const solution = await prisma.solution.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(trademark !== undefined && { trademark }),
      ...(logoKey !== undefined && { logoKey }),
      ...(active !== undefined && { active }),
      ...(sortOrder !== undefined && { sortOrder }),
    },
  })
  return NextResponse.json(solution)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.solution.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
