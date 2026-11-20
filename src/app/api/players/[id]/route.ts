import { proxyCentralApi } from '@/lib/central-api-proxy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyCentralApi(request, `/api/baseball/players/${encodeURIComponent(id)}`)
}
